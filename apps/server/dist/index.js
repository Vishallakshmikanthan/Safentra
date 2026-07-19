"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const PlantGraph_1 = require("./graph/PlantGraph");
const PlantWebSocketServer_1 = require("./websocket/PlantWebSocketServer");
const uuid_1 = require("uuid");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map(origin => origin.trim());
app.disable('x-powered-by');
app.use((0, cors_1.default)({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)), methods: ['GET', 'POST'], maxAge: 86400 }));
app.use(express_1.default.json({ limit: '100kb' }));
app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError)
        return res.status(400).json({ error: 'Invalid JSON request body' });
    next(err);
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Initialize plant graph with default coke oven plant configuration
const initialState = createDefaultPlantState();
const graph = new PlantGraph_1.PlantGraph(initialState);
// Initialize WebSocket server
const wsServer = new PlantWebSocketServer_1.PlantWebSocketServer(server, graph);
wsServer.startTickLoop();
// REST API Routes
app.get('/api/state', (req, res) => {
    res.json(graph.getState());
});
app.get('/api/zones', (req, res) => {
    res.json(graph.getAllZones());
});
app.get('/api/zones/:id', (req, res) => {
    const zone = graph.getZone(req.params.id);
    if (!zone)
        return res.status(404).json({ error: 'Zone not found' });
    res.json(zone);
});
app.get('/api/sensors', (req, res) => {
    res.json(graph.getAllSensors());
});
app.get('/api/sensors/zone/:zoneId', (req, res) => {
    res.json(graph.getSensorsByZone(req.params.zoneId));
});
app.get('/api/workers', (req, res) => {
    res.json(graph.getAllWorkers());
});
app.get('/api/workers/zone/:zoneId', (req, res) => {
    res.json(graph.getWorkersByZone(req.params.zoneId));
});
app.get('/api/permits', (req, res) => {
    res.json(graph.getAllPermits());
});
app.get('/api/permits/zone/:zoneId', (req, res) => {
    res.json(graph.getPermitsByZone(req.params.zoneId));
});
app.post('/api/permits/:id/action', (req, res) => {
    const { action, reason } = req.body;
    const permit = graph.getPermit(req.params.id);
    if (!permit)
        return res.status(404).json({ error: 'Permit not found' });
    if (!['approve', 'block', 'revoke'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }
    wsServer.permitAction({ permitId: req.params.id, action, reason: typeof reason === 'string' ? reason.slice(0, 500) : undefined });
    res.json(graph.getPermit(req.params.id));
});
app.post('/api/permits', (req, res) => {
    const { type, zoneId, requestedBy, validUntil } = req.body;
    if (!['hot_work', 'confined_space_entry', 'electrical_isolation', 'height_work', 'excavation'].includes(type) ||
        typeof zoneId !== 'string' || !graph.getZone(zoneId) || typeof requestedBy !== 'string') {
        return res.status(400).json({ error: 'type, a valid zoneId, and requestedBy are required' });
    }
    const until = validUntil ? new Date(validUntil) : new Date(Date.now() + 3_600_000);
    if (Number.isNaN(until.valueOf()) || until <= new Date())
        return res.status(400).json({ error: 'validUntil must be a future ISO date' });
    const permit = { id: (0, uuid_1.v4)(), type, zoneId, requestedBy: requestedBy.slice(0, 120), validFrom: new Date().toISOString(), validUntil: until.toISOString(), status: 'pending' };
    graph.addPermit(permit);
    res.status(201).json(permit);
});
app.post('/api/sensors/:id/readings', (req, res) => {
    const value = Number(req.body?.value);
    if (!Number.isFinite(value))
        return res.status(400).json({ error: 'value must be a finite number' });
    if (!wsServer.updateSensor(req.params.id, value))
        return res.status(404).json({ error: 'Sensor not found' });
    res.json(graph.getSensor(req.params.id));
});
app.post('/api/workers/:id/move', (req, res) => {
    const { zoneId, position, status } = req.body;
    if (!graph.getWorker(req.params.id))
        return res.status(404).json({ error: 'Worker not found' });
    if (!graph.getZone(zoneId) || !position || !Number.isFinite(position.x) || !Number.isFinite(position.y) || !['active', 'in_confined_space', 'evacuating', 'safe'].includes(status)) {
        return res.status(400).json({ error: 'valid zoneId, position, and status are required' });
    }
    wsServer.moveWorker({ workerId: req.params.id, zoneId, position, status });
    res.json(graph.getWorker(req.params.id));
});
app.get('/api/risk-events', (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    res.json(graph.getRiskEvents(limit));
});
app.get('/api/risk-events/zone/:zoneId', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json(graph.getRiskEventsByZone(req.params.zoneId, limit));
});
app.get('/api/alerts', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json(graph.getAlerts(limit));
});
app.get('/api/patterns', (req, res) => {
    const patternMatcher = wsServer.getPatternMatcher();
    res.json(patternMatcher.getAllMatchedPatterns());
});
app.get('/api/patterns/zone/:zoneId', (req, res) => {
    const patternMatcher = wsServer.getPatternMatcher();
    res.json(patternMatcher.evaluateZone(req.params.zoneId));
});
app.get('/api/safety-debt', (req, res) => {
    const safetyDebt = wsServer.getSafetyDebt();
    const zones = graph.getAllZones();
    const riskScores = new Map();
    zones.forEach(z => riskScores.set(z.id, z.riskScore));
    res.json(safetyDebt.getAllDebtMetrics(zones, riskScores));
});
app.get('/api/safety-debt/summary', (req, res) => {
    const safetyDebt = wsServer.getSafetyDebt();
    res.json(safetyDebt.getPlantDebtSummary(graph.getAllZones()));
});
app.get('/api/simulation/state', (req, res) => {
    res.json(wsServer.getSimulationState());
});
app.post('/api/simulation/control', (req, res) => {
    const { action, speed } = req.body;
    if (!['start', 'stop', 'pause', 'speed'].includes(action) || (action === 'speed' && !Number.isFinite(speed))) {
        return res.status(400).json({ error: 'Invalid simulation command' });
    }
    wsServer.controlSimulation({ action, speed });
    res.json(wsServer.getSimulationState());
});
app.get('/api/chaos', (req, res) => {
    res.json(wsServer.getChaosState());
});
app.post('/api/chaos/inject', (req, res) => {
    const { type, zoneId, parameters = {}, duration = 30, severity = 'medium' } = req.body;
    if (!['sensor_spike', 'worker_incapacitated', 'permit_conflict', 'sensor_failure', 'zone_isolation', 'gas_leak', 'fire_outbreak', 'equipment_failure'].includes(type) || !graph.getZone(zoneId) || !Number.isFinite(duration) || duration < 1 || duration > 3600 || !['low', 'medium', 'high', 'critical'].includes(severity)) {
        return res.status(400).json({ error: 'Invalid chaos injection' });
    }
    const injection = { id: (0, uuid_1.v4)(), type, zoneId, parameters, duration, severity, injectedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + duration * 1000).toISOString() };
    wsServer.injectChaos(injection);
    res.status(202).json(injection);
});
app.get('/api/agents', (req, res) => {
    res.json(wsServer.getAgentStatuses());
});
app.post('/api/oracle/query', async (req, res) => {
    const question = req.body?.question;
    if (typeof question !== 'string' || question.trim().length < 5 || question.length > 2000)
        return res.status(400).json({ error: 'question must be 5–2000 characters' });
    const elevated = graph.getElevatedSensors().map(sensor => `${sensor.id} (${sensor.currentValue}${sensor.unit})`);
    res.json({ answer: `Operational guidance: assess the affected zone, verify permits, and follow the approved emergency procedure. Current elevated readings: ${elevated.join(', ') || 'none'}.`, sources: ['OISD-GDN-169', 'OISD-STD-105'], confidence: elevated.length ? 0.82 : 0.65, relatedPatterns: wsServer.getPatternMatcher().evaluateAll().filter(p => p.matched).map(p => p.patternId) });
});
app.post('/api/forge/submit', (req, res) => {
    const { description, zoneId, severity = 'near_miss', tags = [] } = req.body;
    if (typeof description !== 'string' || description.trim().length < 20 || description.length > 5000 || !graph.getZone(zoneId) || !['near_miss', 'unsafe_condition', 'unsafe_act'].includes(severity) || !Array.isArray(tags))
        return res.status(400).json({ error: 'Invalid near-miss submission' });
    const terms = ['gas', 'confined', 'hot work', 'shift', 'oxygen'].filter(term => description.toLowerCase().includes(term));
    res.status(201).json({ id: (0, uuid_1.v4)(), status: 'candidate', confidence: Math.min(0.95, 0.45 + terms.length * 0.1), suggestedConditions: terms, sourceZoneId: zoneId });
});
app.post('/api/checkpoint/scan', (req, res) => {
    const { workerId, zoneId, permitId } = req.body;
    if (!graph.getWorker(workerId) || !graph.getZone(zoneId))
        return res.status(400).json({ error: 'Valid workerId and zoneId are required' });
    const zone = graph.getZone(zoneId);
    const blocked = zone.riskScore >= 0.6 || (permitId && graph.getPermit(permitId)?.status === 'blocked');
    res.json({ workerId, zoneId, permitId, timestamp: new Date().toISOString(), status: blocked ? 'blocked' : zone.riskScore >= 0.3 ? 'requires_escort' : 'cleared', reason: blocked ? 'Compound risk requires entry restriction' : undefined });
});
app.get('/api/ledger', (req, res) => res.json(wsServer.getLedger().list(Math.min(500, Math.max(1, Number(req.query.limit) || 100)))));
app.get('/api/ledger/verify', (_req, res) => res.json(wsServer.getLedger().verify()));
// Start server
server.listen(PORT, () => {
    console.log(`Safentra Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
    console.log(`REST API available at http://localhost:${PORT}/api`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    wsServer.stopTickLoop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    wsServer.stopTickLoop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
function createDefaultPlantState() {
    const zones = [
        {
            id: 'zone-1',
            name: 'Coke Oven Battery 1',
            type: 'coke_oven',
            adjacentZones: ['zone-2', 'zone-3'],
            hazardClass: 'A',
            polygon: [[100, 100], [300, 100], [300, 250], [100, 250]],
            riskScore: 0,
            rawRiskScore: 0,
            safetyDebt: 0,
            activeWorkers: [],
            activePermits: [],
            sensors: ['sensor-1', 'sensor-2', 'sensor-3', 'sensor-4']
        },
        {
            id: 'zone-2',
            name: 'Coke Oven Battery 2',
            type: 'coke_oven',
            adjacentZones: ['zone-1', 'zone-4'],
            hazardClass: 'A',
            polygon: [[350, 100], [550, 100], [550, 250], [350, 250]],
            riskScore: 0,
            rawRiskScore: 0,
            safetyDebt: 0,
            activeWorkers: [],
            activePermits: [],
            sensors: ['sensor-5', 'sensor-6', 'sensor-7', 'sensor-8']
        },
        {
            id: 'zone-3',
            name: 'Gas Holder',
            type: 'gas_holder',
            adjacentZones: ['zone-1', 'zone-5'],
            hazardClass: 'A',
            polygon: [[100, 300], [300, 300], [300, 450], [100, 450]],
            riskScore: 0,
            rawRiskScore: 0,
            safetyDebt: 0,
            activeWorkers: [],
            activePermits: [],
            sensors: ['sensor-9', 'sensor-10', 'sensor-11']
        },
        {
            id: 'zone-4',
            name: 'Maintenance Bay',
            type: 'maintenance_bay',
            adjacentZones: ['zone-2', 'zone-6'],
            hazardClass: 'B',
            polygon: [[350, 300], [550, 300], [550, 450], [350, 450]],
            riskScore: 0,
            rawRiskScore: 0,
            safetyDebt: 0,
            activeWorkers: [],
            activePermits: [],
            sensors: ['sensor-12', 'sensor-13']
        },
        {
            id: 'zone-5',
            name: 'Control Room',
            type: 'control_room',
            adjacentZones: ['zone-3', 'zone-6'],
            hazardClass: 'C',
            polygon: [[100, 500], [300, 500], [300, 600], [100, 600]],
            riskScore: 0,
            rawRiskScore: 0,
            safetyDebt: 0,
            activeWorkers: [],
            activePermits: [],
            sensors: ['sensor-14']
        },
        {
            id: 'zone-6',
            name: 'Entry Point',
            type: 'entry_point',
            adjacentZones: ['zone-4', 'zone-5'],
            hazardClass: 'B',
            polygon: [[350, 500], [550, 500], [550, 600], [350, 600]],
            riskScore: 0,
            rawRiskScore: 0,
            safetyDebt: 0,
            activeWorkers: [],
            activePermits: [],
            sensors: ['sensor-15', 'sensor-16']
        }
    ];
    const sensors = [
        // Zone 1 - Coke Oven Battery 1
        { id: 'sensor-1', zoneId: 'zone-1', type: 'gas_pressure', currentValue: 1.2, unit: 'bar', normalRange: [1.0, 1.5], alarmThreshold: 2.0, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-2', zoneId: 'zone-1', type: 'h2s_concentration', currentValue: 5, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-3', zoneId: 'zone-1', type: 'co_concentration', currentValue: 15, unit: 'ppm', normalRange: [0, 25], alarmThreshold: 50, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-4', zoneId: 'zone-1', type: 'temperature', currentValue: 45, unit: '°C', normalRange: [30, 60], alarmThreshold: 80, status: 'normal', lastUpdated: new Date().toISOString() },
        // Zone 2 - Coke Oven Battery 2
        { id: 'sensor-5', zoneId: 'zone-2', type: 'gas_pressure', currentValue: 1.1, unit: 'bar', normalRange: [1.0, 1.5], alarmThreshold: 2.0, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-6', zoneId: 'zone-2', type: 'h2s_concentration', currentValue: 3, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-7', zoneId: 'zone-2', type: 'co_concentration', currentValue: 10, unit: 'ppm', normalRange: [0, 25], alarmThreshold: 50, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-8', zoneId: 'zone-2', type: 'temperature', currentValue: 42, unit: '°C', normalRange: [30, 60], alarmThreshold: 80, status: 'normal', lastUpdated: new Date().toISOString() },
        // Zone 3 - Gas Holder
        { id: 'sensor-9', zoneId: 'zone-3', type: 'gas_pressure', currentValue: 0.8, unit: 'bar', normalRange: [0.5, 1.2], alarmThreshold: 1.5, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-10', zoneId: 'zone-3', type: 'h2s_concentration', currentValue: 2, unit: 'ppm', normalRange: [0, 5], alarmThreshold: 15, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-11', zoneId: 'zone-3', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
        // Zone 4 - Maintenance Bay
        { id: 'sensor-12', zoneId: 'zone-4', type: 'h2s_concentration', currentValue: 1, unit: 'ppm', normalRange: [0, 5], alarmThreshold: 10, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-13', zoneId: 'zone-4', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
        // Zone 5 - Control Room
        { id: 'sensor-14', zoneId: 'zone-5', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
        // Zone 6 - Entry Point
        { id: 'sensor-15', zoneId: 'zone-6', type: 'proximity', currentValue: 0, unit: 'm', normalRange: [0, 2], alarmThreshold: 0.5, status: 'normal', lastUpdated: new Date().toISOString() },
        { id: 'sensor-16', zoneId: 'zone-6', type: 'flow_rate', currentValue: 100, unit: 'm³/h', normalRange: [80, 120], alarmThreshold: 150, status: 'normal', lastUpdated: new Date().toISOString() }
    ];
    const workers = [
        { id: 'worker-1', name: 'Rajesh Kumar', role: 'Operator', currentZoneId: 'zone-1', status: 'active', position: { x: 150, y: 150 }, shift: 'on_shift' },
        { id: 'worker-2', name: 'Priya Sharma', role: 'Supervisor', currentZoneId: 'zone-2', status: 'active', position: { x: 400, y: 150 }, shift: 'on_shift' },
        { id: 'worker-3', name: 'Amit Singh', role: 'Maintenance', currentZoneId: 'zone-4', status: 'active', position: { x: 400, y: 350 }, shift: 'on_shift' },
        { id: 'worker-4', name: 'Sunita Devi', role: 'Control Room Operator', currentZoneId: 'zone-5', status: 'active', position: { x: 150, y: 550 }, shift: 'on_shift' },
        { id: 'worker-5', name: 'Vikram Patel', role: 'Safety Officer', currentZoneId: 'zone-6', status: 'active', position: { x: 400, y: 550 }, shift: 'on_shift' },
        { id: 'worker-6', name: 'Deepak Verma', role: 'Operator', currentZoneId: 'zone-1', status: 'active', position: { x: 200, y: 200 }, shift: 'incoming' },
        { id: 'worker-7', name: 'Meera Joshi', role: 'Operator', currentZoneId: 'zone-3', status: 'active', position: { x: 150, y: 350 }, shift: 'outgoing' }
    ];
    const permits = [
        {
            id: 'permit-1',
            type: 'hot_work',
            zoneId: 'zone-1',
            requestedBy: 'worker-1',
            validFrom: new Date(Date.now() - 3600000).toISOString(),
            validUntil: new Date(Date.now() + 7200000).toISOString(),
            status: 'active',
            regulatoryRef: 'DGMS Circular 2023/04'
        },
        {
            id: 'permit-2',
            type: 'confined_space_entry',
            zoneId: 'zone-3',
            requestedBy: 'worker-3',
            validFrom: new Date(Date.now() - 1800000).toISOString(),
            validUntil: new Date(Date.now() + 5400000).toISOString(),
            status: 'active',
            regulatoryRef: 'DGMS Circular 2022/11'
        },
        {
            id: 'permit-3',
            type: 'electrical_isolation',
            zoneId: 'zone-4',
            requestedBy: 'worker-3',
            validFrom: new Date(Date.now() - 7200000).toISOString(),
            validUntil: new Date(Date.now() + 10800000).toISOString(),
            status: 'active',
            regulatoryRef: 'IE Rules 1956'
        }
    ];
    return {
        zones: Object.fromEntries(zones.map(z => [z.id, z])),
        sensors: Object.fromEntries(sensors.map(s => [s.id, s])),
        workers: Object.fromEntries(workers.map(w => [w.id, w])),
        permits: Object.fromEntries(permits.map(p => [p.id, p])),
        riskEvents: [],
        alerts: [],
        shiftChangeover: false
    };
}
//# sourceMappingURL=index.js.map