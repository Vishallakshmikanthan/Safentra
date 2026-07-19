"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantWebSocketServer = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const PatternMatcher_1 = require("../graph/PatternMatcher");
const RiskScorer_1 = require("../graph/RiskScorer");
const SafetyDebt_1 = require("../graph/SafetyDebt");
const HashChain_1 = require("../ledger/HashChain");
class PlantWebSocketServer {
    wss;
    clients = new Map();
    graph;
    patternMatcher;
    riskScorer;
    safetyDebt;
    tickInterval = null;
    tickRate = 500; // 500ms
    simulationState = {
        running: false,
        currentTime: 0,
        speed: 1,
        scenarioId: null,
        events: [],
        eventIndex: 0
    };
    chaosState = {
        activeInjections: [],
        history: []
    };
    agentStatuses = new Map();
    ledger = new HashChain_1.HashChain();
    activeRiskSignatures = new Map();
    constructor(server, graph) {
        this.graph = graph;
        this.patternMatcher = new PatternMatcher_1.PatternMatcher(graph);
        this.riskScorer = new RiskScorer_1.RiskScorer();
        this.safetyDebt = new SafetyDebt_1.SafetyDebt();
        this.wss = new ws_1.WebSocketServer({ server });
        this.setupWebSocketServer();
        this.initializeAgentStatuses();
    }
    initializeAgentStatuses() {
        const agents = ['ARGUS', 'ATLAS', 'ORACLE', 'SHIELD', 'BLAZE', 'FORGE', 'CHAOS'];
        agents.forEach(name => {
            this.agentStatuses.set(name, {
                name,
                status: 'idle',
                lastRun: new Date().toISOString()
            });
        });
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws, req) => {
            const clientId = (0, uuid_1.v4)();
            const client = {
                id: clientId,
                ws,
                subscriptions: ['all'],
                connectedAt: new Date().toISOString()
            };
            this.clients.set(clientId, client);
            console.log(`Client connected: ${clientId} (${this.clients.size} total)`);
            // Send initial state
            this.sendToClient(clientId, {
                type: 'state_update',
                payload: this.graph.getState(),
                timestamp: new Date().toISOString()
            });
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(clientId, message);
                }
                catch (e) {
                    console.error('Invalid message:', e);
                }
            });
            ws.on('close', () => {
                this.clients.delete(clientId);
                console.log(`Client disconnected: ${clientId} (${this.clients.size} remaining)`);
            });
            ws.on('error', (error) => {
                console.error(`WebSocket error for ${clientId}:`, error);
                this.clients.delete(clientId);
            });
        });
    }
    handleMessage(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client)
            return;
        switch (message.type) {
            case 'subscribe':
                if (Array.isArray(message.payload)) {
                    client.subscriptions = message.payload;
                }
                break;
            case 'unsubscribe':
                if (Array.isArray(message.payload)) {
                    client.subscriptions = client.subscriptions.filter(s => !message.payload.includes(s));
                }
                break;
            case 'permit_action':
                this.handlePermitAction(message.payload);
                break;
            case 'worker_move':
                this.handleWorkerMove(message.payload);
                break;
            case 'chaos_inject':
                this.handleChaosInjection(message.payload);
                break;
            case 'simulation_control':
                this.handleSimulationControl(message.payload);
                break;
            case 'oracle_query':
                this.handleOracleQuery(clientId, message.payload);
                break;
            case 'forge_submission':
                this.handleForgeSubmission(message.payload);
                break;
            case 'checkpoint_scan':
                this.handleCheckpointScan(clientId, message.payload);
                break;
            case 'agent_trigger':
                this.handleAgentTrigger(message.payload);
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }
    handlePermitAction(payload) {
        const { permitId, action, reason } = payload;
        const permit = this.graph.getPermit(permitId);
        if (!permit)
            return;
        if (action === 'approve') {
            this.graph.updatePermitStatus(permitId, 'active');
            this.broadcast({
                type: 'permit_approved',
                payload: { permitId, permit: this.graph.getPermit(permitId) },
                timestamp: new Date().toISOString()
            });
        }
        else if (action === 'block') {
            this.graph.blockPermit(permitId, reason || 'Blocked by operator');
            this.broadcast({
                type: 'permit_blocked',
                payload: { permitId, reason: reason || 'Blocked by operator', permit: this.graph.getPermit(permitId) },
                timestamp: new Date().toISOString()
            });
        }
        else if (action === 'revoke') {
            this.graph.updatePermitStatus(permitId, 'revoked');
            this.broadcast({
                type: 'permit_blocked',
                payload: { permitId, reason: 'Revoked by operator', permit: this.graph.getPermit(permitId) },
                timestamp: new Date().toISOString()
            });
        }
        this.ledger.append('permit_action', { permitId, action, reason });
        this.broadcastState();
    }
    handleWorkerMove(payload) {
        this.graph.moveWorker(payload.workerId, payload.zoneId, payload.position, payload.status);
        this.broadcast({
            type: 'worker_moved',
            payload: { worker: this.graph.getWorker(payload.workerId) },
            timestamp: new Date().toISOString()
        });
        this.ledger.append('worker_movement', payload);
        this.broadcastState();
    }
    handleChaosInjection(payload) {
        const injection = {
            ...payload,
            id: payload.id || `chaos-${Date.now()}`,
            injectedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + payload.duration * 1000).toISOString()
        };
        this.chaosState.activeInjections.push(injection);
        this.chaosState.history.push(injection);
        this.ledger.append('chaos_injection', injection);
        // Apply chaos effect
        this.applyChaosInjection(injection);
        this.broadcast({
            type: 'chaos_injected',
            payload: injection,
            timestamp: new Date().toISOString()
        });
        // Schedule removal
        setTimeout(() => {
            this.removeChaosInjection(injection.id);
        }, payload.duration * 1000);
    }
    applyChaosInjection(injection) {
        switch (injection.type) {
            case 'sensor_spike':
                this.applySensorSpike(injection);
                break;
            case 'worker_incapacitated':
                this.applyWorkerIncapacitated(injection);
                break;
            case 'permit_conflict':
                this.applyPermitConflict(injection);
                break;
            case 'sensor_failure':
                this.applySensorFailure(injection);
                break;
            case 'zone_isolation':
                this.applyZoneIsolation(injection);
                break;
            case 'gas_leak':
                this.applyGasLeak(injection);
                break;
            case 'fire_outbreak':
                this.applyFireOutbreak(injection);
                break;
            case 'equipment_failure':
                this.applyEquipmentFailure(injection);
                break;
        }
    }
    applySensorSpike(injection) {
        const { zoneId, parameters } = injection;
        const sensors = this.graph.getSensorsByZone(zoneId);
        const sensorType = parameters.sensorType;
        const spikeValue = parameters.value;
        sensors.filter(s => s.type === sensorType).forEach(sensor => {
            this.graph.updateSensor(sensor.id, spikeValue);
        });
    }
    applyWorkerIncapacitated(injection) {
        const { zoneId, parameters } = injection;
        const workers = this.graph.getWorkersByZone(zoneId);
        const workerId = parameters.workerId;
        const worker = workers.find(w => w.id === workerId) || workers[0];
        if (worker) {
            this.graph.updateWorkerStatus(worker.id, 'evacuating');
        }
    }
    applyPermitConflict(injection) {
        const { zoneId } = injection;
        const permits = this.graph.getPermitsByZone(zoneId);
        const activePermits = permits.filter(p => p.status === 'active');
        if (activePermits.length >= 2) {
            activePermits[0].status = 'blocked';
            activePermits[0].blockedReason = 'Chaos injection: permit conflict';
        }
    }
    applySensorFailure(injection) {
        const { zoneId, parameters } = injection;
        const sensors = this.graph.getSensorsByZone(zoneId);
        const sensorType = parameters.sensorType;
        sensors.filter(s => s.type === sensorType).forEach(sensor => {
            this.graph.updateSensorStatus(sensor.id, 'offline');
        });
    }
    applyZoneIsolation(injection) {
        // Zone isolation - workers cannot enter/leave
        const { zoneId } = injection;
        const workers = this.graph.getWorkersByZone(zoneId);
        workers.forEach(worker => {
            this.graph.updateWorkerStatus(worker.id, 'evacuating');
        });
    }
    applyGasLeak(injection) {
        const { zoneId, parameters } = injection;
        const sensors = this.graph.getSensorsByZone(zoneId);
        const gasType = parameters.gasType || 'h2s_concentration';
        const leakValue = parameters.value || 50;
        sensors.filter(s => s.type === gasType).forEach(sensor => {
            this.graph.updateSensor(sensor.id, leakValue);
        });
    }
    applyFireOutbreak(injection) {
        const { zoneId, parameters } = injection;
        const sensors = this.graph.getSensorsByZone(zoneId);
        const tempValue = parameters.temperature || 200;
        sensors.filter(s => s.type === 'temperature').forEach(sensor => {
            this.graph.updateSensor(sensor.id, tempValue);
        });
        // Also trigger gas sensors
        sensors.filter(s => s.type === 'co_concentration' || s.type === 'h2s_concentration').forEach(sensor => {
            this.graph.updateSensor(sensor.id, sensor.currentValue * 3);
        });
    }
    applyEquipmentFailure(injection) {
        const { zoneId, parameters } = injection;
        const sensors = this.graph.getSensorsByZone(zoneId);
        const sensorType = parameters.sensorType;
        sensors.filter(s => s.type === sensorType).forEach(sensor => {
            this.graph.updateSensorStatus(sensor.id, 'offline');
        });
    }
    removeChaosInjection(injectionId) {
        const index = this.chaosState.activeInjections.findIndex(i => i.id === injectionId);
        if (index !== -1) {
            this.chaosState.activeInjections.splice(index, 1);
            this.broadcast({
                type: 'chaos_injected',
                payload: { id: injectionId, expired: true },
                timestamp: new Date().toISOString()
            });
        }
    }
    handleSimulationControl(payload) {
        switch (payload.action) {
            case 'start':
                this.simulationState.running = true;
                if (payload.scenarioId) {
                    this.simulationState.scenarioId = payload.scenarioId;
                    this.simulationState.eventIndex = 0;
                    this.simulationState.currentTime = 0;
                }
                break;
            case 'stop':
                this.simulationState.running = false;
                this.simulationState.currentTime = 0;
                this.simulationState.eventIndex = 0;
                break;
            case 'pause':
                this.simulationState.running = false;
                break;
            case 'speed':
                if (payload.speed !== undefined) {
                    this.simulationState.speed = payload.speed;
                }
                break;
        }
        this.broadcast({
            type: 'simulation_tick',
            payload: { state: this.simulationState },
            timestamp: new Date().toISOString()
        });
    }
    async handleOracleQuery(clientId, payload) {
        this.updateAgentStatus('ORACLE', 'running');
        // Simulate Oracle RAG response
        const response = await this.simulateOracleResponse(payload.question, payload.context);
        this.updateAgentStatus('ORACLE', 'idle', response);
        this.sendToClient(clientId, {
            type: 'alert',
            payload: { type: 'oracle_response', ...response },
            timestamp: new Date().toISOString()
        });
    }
    async simulateOracleResponse(question, context) {
        // Simulate RAG response - in production would call Anthropic API
        await new Promise(r => setTimeout(r, 500));
        return {
            answer: `Based on current plant state and safety regulations: ${question}`,
            sources: ['DGMS Guidelines', 'Plant Safety Manual', 'Historical Incident Reports'],
            confidence: 0.85,
            relatedPatterns: ['P1', 'P2', 'P12']
        };
    }
    handleForgeSubmission(payload) {
        this.updateAgentStatus('FORGE', 'running');
        // Process near-miss report
        console.log('FORGE submission:', payload);
        this.updateAgentStatus('FORGE', 'idle', { patternCandidate: 'New pattern detected from near-miss cluster' });
    }
    handleCheckpointScan(clientId, payload) {
        // Handle mobile QR checkpoint scan
        console.log('Checkpoint scan:', payload);
        this.sendToClient(clientId, {
            type: 'alert',
            payload: { type: 'checkpoint_result', ...payload, status: 'cleared' },
            timestamp: new Date().toISOString()
        });
    }
    handleAgentTrigger(payload) {
        const { agent, action } = payload;
        this.updateAgentStatus(agent, 'running');
        console.log(`Agent ${agent} triggered: ${action}`);
        // Agent logic would go here
        setTimeout(() => this.updateAgentStatus(agent, 'idle'), 1000);
    }
    updateAgentStatus(name, status, lastResult) {
        const agent = this.agentStatuses.get(name);
        if (agent) {
            agent.status = status;
            agent.lastRun = new Date().toISOString();
            if (lastResult)
                agent.lastResult = lastResult;
        }
    }
    startTickLoop() {
        if (this.tickInterval)
            return;
        this.tickInterval = setInterval(() => {
            this.tick();
        }, this.tickRate);
        console.log(`WebSocket tick loop started at ${this.tickRate}ms`);
    }
    stopTickLoop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    }
    tick() {
        // Run simulation step if active
        if (this.simulationState.running) {
            this.runSimulationStep();
        }
        // Evaluate patterns
        const patternResults = this.patternMatcher.evaluateAll();
        // Calculate risk scores and update zones
        const zones = this.graph.getAllZones();
        const riskScores = new Map();
        zones.forEach(zone => {
            const zonePatterns = patternResults.filter(p => p.zoneId === zone.id);
            const { riskScore, rawRiskScore, severity } = this.riskScorer.calculateRiskScore(zone, zonePatterns);
            this.graph.updateZoneRisk(zone.id, riskScore, rawRiskScore);
            // Update safety debt
            const debtMetrics = this.safetyDebt.updateDebt(zone, riskScore, this.tickRate);
            this.graph.updateZoneSafetyDebt(zone.id, debtMetrics.currentDebt);
            riskScores.set(zone.id, riskScore);
            // Emit only when the active compound-risk set changes. Emitting an event on
            // every tick would flood operators and make the audit trail unusable.
            const riskEvent = this.riskScorer.createRiskEvent(zone, zonePatterns);
            const signature = zonePatterns.filter(p => p.matched).map(p => p.patternId).sort().join('|');
            if (riskEvent && signature && this.activeRiskSignatures.get(zone.id) !== signature) {
                this.activeRiskSignatures.set(zone.id, signature);
                this.graph.addRiskEvent(riskEvent);
                this.ledger.append('risk_event', riskEvent);
                this.broadcast({
                    type: 'risk_event',
                    payload: riskEvent,
                    timestamp: new Date().toISOString()
                });
            }
            if (!signature)
                this.activeRiskSignatures.delete(zone.id);
        });
        this.broadcastState();
        // Broadcast safety debt updates
        const debtSummary = this.safetyDebt.getPlantDebtSummary(zones);
        this.broadcast({
            type: 'safety_debt_update',
            payload: debtSummary,
            timestamp: new Date().toISOString()
        });
    }
    runSimulationStep() {
        // Process simulation events
        const { events, eventIndex, speed } = this.simulationState;
        if (eventIndex >= events.length) {
            this.simulationState.running = false;
            return;
        }
        const currentEvent = events[eventIndex];
        if (this.simulationState.currentTime >= currentEvent.timestamp) {
            this.processSimulationEvent(currentEvent);
            this.simulationState.eventIndex++;
        }
        this.simulationState.currentTime += this.tickRate * speed;
    }
    processSimulationEvent(event) {
        switch (event.type) {
            case 'sensor_change':
                this.graph.updateSensor(event.payload.sensorId, event.payload.value);
                break;
            case 'worker_move':
                this.graph.moveWorker(event.payload.workerId, event.payload.zoneId, event.payload.position, event.payload.status);
                break;
            case 'permit_request':
                // Handle permit request
                break;
            case 'chaos_inject':
                this.handleChaosInjection(event.payload);
                break;
            case 'shift_change':
                this.graph.setShiftChangeover(event.payload.active);
                break;
        }
    }
    broadcastState() {
        this.broadcast({ type: 'state_update', payload: this.graph.getState(), timestamp: new Date().toISOString() });
    }
    broadcast(message) {
        const data = JSON.stringify(message);
        this.clients.forEach((client, clientId) => {
            if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                // Check subscription
                if (client.subscriptions.includes('all') ||
                    client.subscriptions.includes(message.type) ||
                    (message.payload && typeof message.payload === 'object' && 'zoneId' in message.payload &&
                        client.subscriptions.includes(`zone:${message.payload.zoneId}`))) {
                    client.ws.send(data);
                }
            }
        });
    }
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client && client.ws.readyState === ws_1.WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }
    getConnectedClients() {
        return this.clients.size;
    }
    getSimulationState() {
        return this.simulationState;
    }
    getChaosState() {
        return this.chaosState;
    }
    getAgentStatuses() {
        return Array.from(this.agentStatuses.values());
    }
    getGraph() {
        return this.graph;
    }
    getPatternMatcher() {
        return this.patternMatcher;
    }
    getRiskScorer() {
        return this.riskScorer;
    }
    getSafetyDebt() {
        return this.safetyDebt;
    }
    getLedger() {
        return this.ledger;
    }
    /** REST-safe command entry points; the WebSocket protocol uses the same logic. */
    permitAction(payload) {
        this.handlePermitAction(payload);
    }
    moveWorker(payload) {
        this.handleWorkerMove(payload);
    }
    injectChaos(payload) {
        this.handleChaosInjection(payload);
    }
    controlSimulation(payload) {
        this.handleSimulationControl(payload);
    }
    updateSensor(sensorId, value) {
        if (!Number.isFinite(value) || !this.graph.getSensor(sensorId))
            return false;
        this.graph.updateSensor(sensorId, value);
        this.ledger.append('sensor_reading', { sensorId, value });
        this.broadcastState();
        return true;
    }
    setShiftChangeover(active) {
        this.graph.setShiftChangeover(active);
        this.ledger.append('shift_changeover', { active });
        this.broadcastState();
    }
}
exports.PlantWebSocketServer = PlantWebSocketServer;
//# sourceMappingURL=PlantWebSocketServer.js.map