import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { PlantGraph } from '../graph/PlantGraph';
import { PatternMatcher } from '../graph/PatternMatcher';
import { RiskScorer } from '../graph/RiskScorer';
import { SafetyDebt } from '../graph/SafetyDebt';
import { HashChain } from '../ledger/HashChain';
import { PlantState, WebSocketMessage, WebSocketClient, Zone, Sensor, Worker, Permit, RiskEvent, Alert, ChaosInjection, SimulationState, ChaosState, AgentStatus, SimulationEvent } from '@safentra/types';

export class PlantWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private graph: PlantGraph;
  private patternMatcher: PatternMatcher;
  private riskScorer: RiskScorer;
  private safetyDebt: SafetyDebt;
  private tickInterval: NodeJS.Timeout | null = null;
  private tickRate = 500; // 500ms
  private simulationState: SimulationState = {
    running: false,
    currentTime: 0,
    speed: 1,
    scenarioId: null,
    events: [],
    eventIndex: 0
  };
  private chaosState: ChaosState = {
    activeInjections: [],
    history: []
  };
  private agentStatuses: Map<string, AgentStatus> = new Map();
  private readonly ledger = new HashChain();
  private readonly activeRiskSignatures = new Map<string, string>();

  constructor(server: any, graph: PlantGraph) {
    this.graph = graph;
    this.patternMatcher = new PatternMatcher(graph);
    this.riskScorer = new RiskScorer();
    this.safetyDebt = new SafetyDebt();

    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
    this.initializeAgentStatuses();
  }

  private initializeAgentStatuses(): void {
    const agents = ['ARGUS', 'ATLAS', 'ORACLE', 'SHIELD', 'BLAZE', 'FORGE', 'CHAOS'];
    agents.forEach(name => {
      this.agentStatuses.set(name, {
        name,
        status: 'idle',
        lastRun: new Date().toISOString()
      });
    });
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const clientId = uuidv4();
      const client: WebSocketClient = {
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

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (e) {
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

  private handleMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

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

  private handlePermitAction(payload: { permitId: string; action: 'approve' | 'block' | 'revoke'; reason?: string }): void {
    const { permitId, action, reason } = payload;
    const permit = this.graph.getPermit(permitId);
    if (!permit) return;

    if (action === 'approve') {
      this.graph.updatePermitStatus(permitId, 'active');
      this.broadcast({
        type: 'permit_approved',
        payload: { permitId, permit: this.graph.getPermit(permitId) },
        timestamp: new Date().toISOString()
      });
    } else if (action === 'block') {
      this.graph.blockPermit(permitId, reason || 'Blocked by operator');
      this.broadcast({
        type: 'permit_blocked',
        payload: { permitId, reason: reason || 'Blocked by operator', permit: this.graph.getPermit(permitId) },
        timestamp: new Date().toISOString()
      });
    } else if (action === 'revoke') {
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

  private handleWorkerMove(payload: { workerId: string; zoneId: string; position: { x: number; y: number }; status: Worker['status'] }): void {
    this.graph.moveWorker(payload.workerId, payload.zoneId, payload.position, payload.status);
    this.broadcast({
      type: 'worker_moved',
      payload: { worker: this.graph.getWorker(payload.workerId) },
      timestamp: new Date().toISOString()
    });
    this.ledger.append('worker_movement', payload);
    this.broadcastState();
  }

  private handleChaosInjection(payload: ChaosInjection): void {
    const injection: ChaosInjection = {
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

  private applyChaosInjection(injection: ChaosInjection): void {
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

  private applySensorSpike(injection: ChaosInjection): void {
    const { zoneId, parameters } = injection;
    const sensors = this.graph.getSensorsByZone(zoneId);
    const sensorType = parameters.sensorType as string;
    const spikeValue = parameters.value as number;
    
    sensors.filter(s => s.type === sensorType).forEach(sensor => {
      this.graph.updateSensor(sensor.id, spikeValue);
    });
  }

  private applyWorkerIncapacitated(injection: ChaosInjection): void {
    const { zoneId, parameters } = injection;
    const workers = this.graph.getWorkersByZone(zoneId);
    const workerId = parameters.workerId as string;
    const worker = workers.find(w => w.id === workerId) || workers[0];
    if (worker) {
      this.graph.updateWorkerStatus(worker.id, 'evacuating');
    }
  }

  private applyPermitConflict(injection: ChaosInjection): void {
    const { zoneId } = injection;
    const permits = this.graph.getPermitsByZone(zoneId);
    const activePermits = permits.filter(p => p.status === 'active');
    if (activePermits.length >= 2) {
      activePermits[0].status = 'blocked';
      activePermits[0].blockedReason = 'Chaos injection: permit conflict';
    }
  }

  private applySensorFailure(injection: ChaosInjection): void {
    const { zoneId, parameters } = injection;
    const sensors = this.graph.getSensorsByZone(zoneId);
    const sensorType = parameters.sensorType as string;
    
    sensors.filter(s => s.type === sensorType).forEach(sensor => {
      this.graph.updateSensorStatus(sensor.id, 'offline');
    });
  }

  private applyZoneIsolation(injection: ChaosInjection): void {
    // Zone isolation - workers cannot enter/leave
    const { zoneId } = injection;
    const workers = this.graph.getWorkersByZone(zoneId);
    workers.forEach(worker => {
      this.graph.updateWorkerStatus(worker.id, 'evacuating');
    });
  }

  private applyGasLeak(injection: ChaosInjection): void {
    const { zoneId, parameters } = injection;
    const sensors = this.graph.getSensorsByZone(zoneId);
    const gasType = parameters.gasType as string || 'h2s_concentration';
    const leakValue = parameters.value as number || 50;
    
    sensors.filter(s => s.type === gasType).forEach(sensor => {
      this.graph.updateSensor(sensor.id, leakValue);
    });
  }

  private applyFireOutbreak(injection: ChaosInjection): void {
    const { zoneId, parameters } = injection;
    const sensors = this.graph.getSensorsByZone(zoneId);
    const tempValue = parameters.temperature as number || 200;
    
    sensors.filter(s => s.type === 'temperature').forEach(sensor => {
      this.graph.updateSensor(sensor.id, tempValue);
    });
    
    // Also trigger gas sensors
    sensors.filter(s => s.type === 'co_concentration' || s.type === 'h2s_concentration').forEach(sensor => {
      this.graph.updateSensor(sensor.id, sensor.currentValue * 3);
    });
  }

  private applyEquipmentFailure(injection: ChaosInjection): void {
    const { zoneId, parameters } = injection;
    const sensors = this.graph.getSensorsByZone(zoneId);
    const sensorType = parameters.sensorType as string;
    
    sensors.filter(s => s.type === sensorType).forEach(sensor => {
      this.graph.updateSensorStatus(sensor.id, 'offline');
    });
  }

  private removeChaosInjection(injectionId: string): void {
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

  private handleSimulationControl(payload: { action: 'start' | 'stop' | 'pause' | 'speed'; scenarioId?: string; speed?: number }): void {
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

  private async handleOracleQuery(clientId: string, payload: { question: string; context?: any }): Promise<void> {
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

  private async simulateOracleResponse(question: string, context?: any): Promise<any> {
    // Simulate RAG response - in production would call Anthropic API
    await new Promise(r => setTimeout(r, 500));
    return {
      answer: `Based on current plant state and safety regulations: ${question}`,
      sources: ['DGMS Guidelines', 'Plant Safety Manual', 'Historical Incident Reports'],
      confidence: 0.85,
      relatedPatterns: ['P1', 'P2', 'P12']
    };
  }

  private handleForgeSubmission(payload: any): void {
    this.updateAgentStatus('FORGE', 'running');
    // Process near-miss report
    console.log('FORGE submission:', payload);
    this.updateAgentStatus('FORGE', 'idle', { patternCandidate: 'New pattern detected from near-miss cluster' });
  }

  private handleCheckpointScan(clientId: string, payload: any): void {
    // Handle mobile QR checkpoint scan
    console.log('Checkpoint scan:', payload);
    this.sendToClient(clientId, {
      type: 'alert',
      payload: { type: 'checkpoint_result', ...payload, status: 'cleared' },
      timestamp: new Date().toISOString()
    });
  }

  private handleAgentTrigger(payload: { agent: string; action: string; params?: any }): void {
    const { agent, action } = payload;
    this.updateAgentStatus(agent, 'running');
    console.log(`Agent ${agent} triggered: ${action}`);
    // Agent logic would go here
    setTimeout(() => this.updateAgentStatus(agent, 'idle'), 1000);
  }

  private updateAgentStatus(name: string, status: AgentStatus['status'], lastResult?: any): void {
    const agent = this.agentStatuses.get(name);
    if (agent) {
      agent.status = status;
      agent.lastRun = new Date().toISOString();
      if (lastResult) agent.lastResult = lastResult;
    }
  }

  startTickLoop(): void {
    if (this.tickInterval) return;
    
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.tickRate);
    
    console.log(`WebSocket tick loop started at ${this.tickRate}ms`);
  }

  stopTickLoop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private tick(): void {
    // Run simulation step if active
    if (this.simulationState.running) {
      this.runSimulationStep();
    }

    // Evaluate patterns
    const patternResults = this.patternMatcher.evaluateAll();

    // Calculate risk scores and update zones
    const zones = this.graph.getAllZones();
    const riskScores = new Map<string, number>();
    
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
      if (!signature) this.activeRiskSignatures.delete(zone.id);
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

  private runSimulationStep(): void {
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

  private processSimulationEvent(event: any): void {
    switch (event.type) {
      case 'sensor_change':
        this.graph.updateSensor(event.payload.sensorId, event.payload.value);
        break;
      case 'worker_move':
        this.graph.moveWorker(event.payload.workerId, event.payload.zoneId, event.payload.position, event.payload.status);
        break;
      case 'permit_request':
        break;
      case 'chaos_inject':
        this.handleChaosInjection(event.payload);
        break;
      case 'shift_change':
        this.graph.setShiftChangeover(event.payload.active);
        break;
    }
  }

  private broadcastState(): void {
    this.broadcast({ type: 'state_update', payload: this.graph.getState(), timestamp: new Date().toISOString() });
  }

  private broadcast(message: WebSocketMessage): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        if (client.subscriptions.includes('all') ||
            client.subscriptions.includes(message.type) ||
            (message.payload && typeof message.payload === 'object' && 'zoneId' in message.payload &&
             client.subscriptions.includes(`zone:${(message.payload as any).zoneId}`))) {
          client.ws.send(data);
        }
      }
    });
  }

  /** Public broadcast — allows external modules (e.g. SensorSimulator) to push messages. */
  broadcastMessage(message: WebSocketMessage): void {
    this.broadcast(message);
  }

  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  getConnectedClients(): number {
    return this.clients.size;
  }

  getSimulationState(): SimulationState {
    return this.simulationState;
  }


  getChaosState(): ChaosState {
    return this.chaosState;
  }

  getAgentStatuses(): AgentStatus[] {
    return Array.from(this.agentStatuses.values());
  }

  getGraph(): PlantGraph {
    return this.graph;
  }

  getPatternMatcher(): PatternMatcher {
    return this.patternMatcher;
  }

  getRiskScorer(): RiskScorer {
    return this.riskScorer;
  }

  getSafetyDebt(): SafetyDebt {
    return this.safetyDebt;
  }

  getLedger(): HashChain {
    return this.ledger;
  }

  /** REST-safe command entry points; the WebSocket protocol uses the same logic. */
  permitAction(payload: { permitId: string; action: 'approve' | 'block' | 'revoke'; reason?: string }): void {
    this.handlePermitAction(payload);
  }

  moveWorker(payload: { workerId: string; zoneId: string; position: { x: number; y: number }; status: Worker['status'] }): void {
    this.handleWorkerMove(payload);
  }

  injectChaos(payload: ChaosInjection): void {
    this.handleChaosInjection(payload);
  }

  controlSimulation(payload: { action: 'start' | 'stop' | 'pause' | 'speed'; scenarioId?: string; speed?: number }): void {
    this.handleSimulationControl(payload);
  }

  updateSensor(sensorId: string, value: number): boolean {
    if (!Number.isFinite(value) || !this.graph.getSensor(sensorId)) return false;
    this.graph.updateSensor(sensorId, value);
    this.ledger.append('sensor_reading', { sensorId, value });
    this.broadcastState();
    return true;
  }

  setShiftChangeover(active: boolean): void {
    this.graph.setShiftChangeover(active);
    this.ledger.append('shift_changeover', { active });
    this.broadcastState();
  }
}
