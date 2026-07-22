import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { PlantGraph } from './graph/PlantGraph.js';
import { PlantWebSocketServer } from './websocket/PlantWebSocketServer.js';
import { SensorSimulator } from './simulation/SensorSimulator.js';
import { Zone, Sensor, Worker, Permit, PlantState, ZoneType, SensorType, PermitType, WorkerStatus, PermitStatus, WebSocketMessage } from '@safentra/types';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map(origin => origin.trim());
app.disable('x-powered-by');
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)), methods: ['GET', 'POST'], maxAge: 86400 }));
app.use(express.json({ limit: '100kb' }));
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError) return res.status(400).json({ error: 'Invalid JSON request body' });
  next(err);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize plant graph with default coke oven plant configuration
const initialState = createDefaultPlantState();
const graph = new PlantGraph(initialState);

// Initialize WebSocket server
const wsServer = new PlantWebSocketServer(server, graph);
wsServer.startTickLoop();

// ─── Sensor Simulator ────────────────────────────────────────────────────────
// Continuous sensor simulation: runs a 2s tick loop, drives all PlantGraph
// sensors with realistic noise, and autonomously fires danger events.
const sensorSimulator = new SensorSimulator(graph);
sensorSimulator.start();

// Every simulator tick: update sensors → broadcast full state immediately
sensorSimulator.on('tick', () => {
  const dangerElapsed = sensorSimulator.getDangerElapsedSeconds();
  wsServer.broadcastMessage({
    type: 'simulation_tick',
    payload: {
      dangerMode: sensorSimulator.isDangerMode(),
      dangerElapsedSeconds: dangerElapsed,
      sensorReadings: sensorSimulator.getCurrentReadings()
    },
    timestamp: new Date().toISOString()
  });
});

// On mode change: broadcast status so the frontend updates the danger button
sensorSimulator.on('mode_change', (mode: string) => {
  wsServer.broadcastMessage({
    type: 'simulation_status',
    payload: {
      status: mode === 'danger' ? 'danger_active' : 'normal',
      mode,
      dangerMode: mode === 'danger'
    },
    timestamp: new Date().toISOString()
  });
});

// Broadcast autonomous agent activity
sensorSimulator.on('agent_activity', (message: WebSocketMessage) => {
  wsServer.broadcastMessage(message);
});
// ─────────────────────────────────────────────────────────────────────────────

// REST API Routes
app.get('/api/state', (req, res) => {
  res.json(graph.getState());
});

app.get('/api/zones', (req, res) => {
  res.json(graph.getAllZones());
});

app.get('/api/zones/:id', (req, res) => {
  const zone = graph.getZone(req.params.id);
  if (!zone) return res.status(404).json({ error: 'Zone not found' });
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
  if (!permit) return res.status(404).json({ error: 'Permit not found' });

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
  if (Number.isNaN(until.valueOf()) || until <= new Date()) return res.status(400).json({ error: 'validUntil must be a future ISO date' });
  const permit: Permit = { id: uuidv4(), type, zoneId, requestedBy: requestedBy.slice(0, 120), validFrom: new Date().toISOString(), validUntil: until.toISOString(), status: 'pending' };
  graph.addPermit(permit);
  res.status(201).json(permit);
});

app.post('/api/sensors/:id/readings', (req, res) => {
  const value = Number(req.body?.value);
  if (!Number.isFinite(value)) return res.status(400).json({ error: 'value must be a finite number' });
  if (!wsServer.updateSensor(req.params.id, value)) return res.status(404).json({ error: 'Sensor not found' });
  res.json(graph.getSensor(req.params.id));
});

app.post('/api/workers/:id/move', (req, res) => {
  const { zoneId, position, status } = req.body;
  if (!graph.getWorker(req.params.id)) return res.status(404).json({ error: 'Worker not found' });
  if (!graph.getZone(zoneId) || !position || !Number.isFinite(position.x) || !Number.isFinite(position.y) || !['active', 'in_confined_space', 'evacuating', 'safe'].includes(status)) {
    return res.status(400).json({ error: 'valid zoneId, position, and status are required' });
  }
  wsServer.moveWorker({ workerId: req.params.id, zoneId, position, status });
  res.json(graph.getWorker(req.params.id));
});

app.get('/api/risk-events', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json(graph.getRiskEvents(limit));
});

app.get('/api/risk-events/zone/:zoneId', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(graph.getRiskEventsByZone(req.params.zoneId, limit));
});

app.get('/api/alerts', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
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
  const riskScores = new Map<string, number>();
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

// ─── Danger Mode Endpoints ───────────────────────────────────────────────────
app.post('/api/simulation/danger/on', (req, res) => {
  sensorSimulator.setDangerMode(true);
  res.json({ status: 'danger_active', message: 'Sensor anomaly ramp started — Vizag compound pattern scenario active' });
});

app.post('/api/simulation/danger/off', (req, res) => {
  sensorSimulator.setDangerMode(false);
  res.json({ status: 'normal', message: 'Sensors returning to baseline over ~20 seconds' });
});

app.get('/api/simulation/danger/status', (req, res) => {
  res.json({
    mode: sensorSimulator.isDangerMode() ? 'danger' : 'normal',
    dangerActive: sensorSimulator.isDangerMode(),
    dangerElapsedSeconds: sensorSimulator.getDangerElapsedSeconds(),
    sensorReadings: sensorSimulator.getCurrentReadings()
  });
});
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/chaos', (req, res) => {
  res.json(wsServer.getChaosState());
});

app.post('/api/chaos/inject', (req, res) => {
  const { type, zoneId, parameters = {}, duration = 30, severity = 'medium' } = req.body;
  if (!['sensor_spike', 'worker_incapacitated', 'permit_conflict', 'sensor_failure', 'zone_isolation', 'gas_leak', 'fire_outbreak', 'equipment_failure'].includes(type) || !graph.getZone(zoneId) || !Number.isFinite(duration) || duration < 1 || duration > 3600 || !['low', 'medium', 'high', 'critical'].includes(severity)) {
    return res.status(400).json({ error: 'Invalid chaos injection' });
  }
  const injection = { id: uuidv4(), type, zoneId, parameters, duration, severity, injectedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + duration * 1000).toISOString() } as any;
  wsServer.injectChaos(injection);
  res.status(202).json(injection);
});

app.get('/api/agents', (req, res) => {
  res.json(wsServer.getAgentStatuses());
});

app.post('/api/oracle/query', async (req, res) => {
  const question = req.body?.question;
  if (typeof question !== 'string' || question.trim().length < 5 || question.length > 2000) return res.status(400).json({ error: 'question must be 5–2000 characters' });
  const response = await wsServer.queryOracle(question, false);
  res.json(response);
});

app.post('/api/forge/submit', async (req, res) => {
  const { description, zoneId, severity = 'near_miss', tags = [] } = req.body;
  if (typeof description !== 'string' || description.trim().length < 20 || description.length > 5000 || !graph.getZone(zoneId) || !['near_miss', 'unsafe_condition', 'unsafe_act'].includes(severity) || !Array.isArray(tags)) return res.status(400).json({ error: 'Invalid near-miss submission' });
  const candidate = await wsServer.submitForge({ description, zoneId, severity, tags });
  res.status(201).json(candidate);
});

app.get('/api/forge/candidates', (_req, res) => {
  res.json(wsServer.getForgeCandidates());
});

app.post('/api/forge/candidates/:id/approve', (req, res) => {
  const candidate = wsServer.approveForgeCandidate(req.params.id);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json(candidate);
});

app.post('/api/forge/candidates/:id/reject', (req, res) => {
  const candidate = wsServer.rejectForgeCandidate(req.params.id);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json(candidate);
});

app.post('/api/checkpoint/scan', (req, res) => {
  const { workerId, zoneId, permitId } = req.body;
  if (!graph.getWorker(workerId) || !graph.getZone(zoneId)) return res.status(400).json({ error: 'Valid workerId and zoneId are required' });
  const zone = graph.getZone(zoneId)!;
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

function createDefaultPlantState(): Partial<PlantState> {
  const zones: Zone[] = [
    {
      id: 'C1',
      name: 'Coke Oven Battery 1',
      type: 'coke_oven',
      adjacentZones: ['C2', 'C3'],
      hazardClass: 'A',
      polygon: [[100, 100], [300, 100], [300, 250], [100, 250]],
      riskScore: 0,
      rawRiskScore: 0,
      safetyDebt: 0,
      activeWorkers: [],
      activePermits: [],
      sensors: ['S-C1-VOC', 'S-C1-H2S', 'S-C1-CO', 'S-C1-TMP']
    },
    {
      id: 'C2',
      name: 'Coke Oven Battery 2',
      type: 'coke_oven',
      adjacentZones: ['C1', 'C4'],
      hazardClass: 'A',
      polygon: [[350, 100], [550, 100], [550, 250], [350, 250]],
      riskScore: 0,
      rawRiskScore: 0,
      safetyDebt: 0,
      activeWorkers: [],
      activePermits: [],
      sensors: ['S-C2-GAS', 'S-C2-H2S', 'S-C2-CO', 'S-C2-TMP']
    },
    {
      id: 'C3',
      name: 'Gas Holder',
      type: 'gas_holder',
      adjacentZones: ['C1', 'C5'],
      hazardClass: 'A',
      polygon: [[100, 300], [300, 300], [300, 450], [100, 450]],
      riskScore: 0,
      rawRiskScore: 0,
      safetyDebt: 0,
      activeWorkers: [],
      activePermits: [],
      sensors: ['S-C3-GAS', 'S-C3-H2S', 'S-C3-O2']
    },
    {
      id: 'C4',
      name: 'Maintenance Bay',
      type: 'maintenance_bay',
      adjacentZones: ['C2', 'C6'],
      hazardClass: 'B',
      polygon: [[350, 300], [550, 300], [550, 450], [350, 450]],
      riskScore: 0,
      rawRiskScore: 0,
      safetyDebt: 0,
      activeWorkers: [],
      activePermits: [],
      sensors: ['S-C4-GAS', 'S-C4-TMP']
    },
    {
      id: 'C5',
      name: 'Control Room',
      type: 'control_room',
      adjacentZones: ['C3', 'C6'],
      hazardClass: 'C',
      polygon: [[100, 500], [300, 500], [300, 600], [100, 600]],
      riskScore: 0,
      rawRiskScore: 0,
      safetyDebt: 0,
      activeWorkers: [],
      activePermits: [],
      sensors: ['S-C5-O2']
    },
    {
      id: 'C6',
      name: 'Entry Point',
      type: 'entry_point',
      adjacentZones: ['C4', 'C5'],
      hazardClass: 'B',
      polygon: [[350, 500], [550, 500], [550, 600], [350, 600]],
      riskScore: 0,
      rawRiskScore: 0,
      safetyDebt: 0,
      activeWorkers: [],
      activePermits: [],
      sensors: ['S-C5-PRX', 'S-C6-FLW']
    }
  ];

  const sensors: Sensor[] = [
    // Zone 1 - Coke Oven Battery 1
    { id: 'S-C1-VOC', zoneId: 'C1', type: 'gas_pressure', currentValue: 1.2, unit: 'bar', normalRange: [1.0, 1.5], alarmThreshold: 2.0, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C1-H2S', zoneId: 'C1', type: 'h2s_concentration', currentValue: 5, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C1-CO', zoneId: 'C1', type: 'co_concentration', currentValue: 15, unit: 'ppm', normalRange: [0, 25], alarmThreshold: 50, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C1-TMP', zoneId: 'C1', type: 'temperature', currentValue: 45, unit: '°C', normalRange: [30, 60], alarmThreshold: 80, status: 'normal', lastUpdated: new Date().toISOString() },
    // Zone 2 - Coke Oven Battery 2
    { id: 'S-C2-GAS', zoneId: 'C2', type: 'gas_pressure', currentValue: 1.1, unit: 'bar', normalRange: [1.0, 1.5], alarmThreshold: 2.0, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C2-H2S', zoneId: 'C2', type: 'h2s_concentration', currentValue: 3, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C2-CO', zoneId: 'C2', type: 'co_concentration', currentValue: 10, unit: 'ppm', normalRange: [0, 25], alarmThreshold: 50, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C2-TMP', zoneId: 'C2', type: 'temperature', currentValue: 42, unit: '°C', normalRange: [30, 60], alarmThreshold: 80, status: 'normal', lastUpdated: new Date().toISOString() },
    // Zone 3 - Gas Holder
    { id: 'S-C3-GAS', zoneId: 'C3', type: 'gas_pressure', currentValue: 0.8, unit: 'bar', normalRange: [0.5, 1.2], alarmThreshold: 1.5, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C3-H2S', zoneId: 'C3', type: 'h2s_concentration', currentValue: 2, unit: 'ppm', normalRange: [0, 5], alarmThreshold: 15, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C3-O2', zoneId: 'C3', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
    // Zone 4 - Maintenance Bay
    { id: 'S-C4-GAS', zoneId: 'C4', type: 'h2s_concentration', currentValue: 1, unit: 'ppm', normalRange: [0, 5], alarmThreshold: 10, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C4-TMP', zoneId: 'C4', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
    // Zone 5 - Control Room
    { id: 'S-C5-O2', zoneId: 'C5', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
    // Zone 6 - Entry Point
    { id: 'S-C5-PRX', zoneId: 'C6', type: 'proximity', currentValue: 0, unit: 'm', normalRange: [0, 2], alarmThreshold: 0.5, status: 'normal', lastUpdated: new Date().toISOString() },
    { id: 'S-C6-FLW', zoneId: 'C6', type: 'flow_rate', currentValue: 100, unit: 'm³/h', normalRange: [80, 120], alarmThreshold: 150, status: 'normal', lastUpdated: new Date().toISOString() }
  ];

  const workers: Worker[] = [
    { id: 'worker-1', name: 'Rajesh Kumar', role: 'Operator', currentZoneId: 'C1', status: 'active', position: { x: 150, y: 150 }, shift: 'on_shift' },
    { id: 'worker-2', name: 'Priya Sharma', role: 'Supervisor', currentZoneId: 'C2', status: 'active', position: { x: 400, y: 150 }, shift: 'on_shift' },
    { id: 'worker-3', name: 'Amit Singh', role: 'Maintenance', currentZoneId: 'C4', status: 'active', position: { x: 400, y: 350 }, shift: 'on_shift' },
    { id: 'worker-4', name: 'Sunita Devi', role: 'Control Room Operator', currentZoneId: 'C5', status: 'active', position: { x: 150, y: 550 }, shift: 'on_shift' },
    { id: 'worker-5', name: 'Vikram Patel', role: 'Safety Officer', currentZoneId: 'C6', status: 'active', position: { x: 400, y: 550 }, shift: 'on_shift' },
    { id: 'worker-6', name: 'Deepak Verma', role: 'Operator', currentZoneId: 'C1', status: 'active', position: { x: 200, y: 200 }, shift: 'incoming' },
    { id: 'worker-7', name: 'Meera Joshi', role: 'Operator', currentZoneId: 'C3', status: 'active', position: { x: 150, y: 350 }, shift: 'outgoing' }
  ];

  const permits: Permit[] = [
    {
      id: 'permit-1',
      type: 'hot_work',
      zoneId: 'C1',
      requestedBy: 'worker-1',
      validFrom: new Date(Date.now() - 3600000).toISOString(),
      validUntil: new Date(Date.now() + 7200000).toISOString(),
      status: 'active',
      regulatoryRef: 'DGMS Circular 2023/04'
    },
    {
      id: 'permit-2',
      type: 'confined_space_entry',
      zoneId: 'C3',
      requestedBy: 'worker-3',
      validFrom: new Date(Date.now() - 1800000).toISOString(),
      validUntil: new Date(Date.now() + 5400000).toISOString(),
      status: 'active',
      regulatoryRef: 'DGMS Circular 2022/11'
    },
    {
      id: 'permit-3',
      type: 'electrical_isolation',
      zoneId: 'C4',
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
    alerts: [
      { id: 'A1', timestamp: new Date(Date.now() - 5000).toISOString(), zoneId: 'C4', message: 'H2S concentration exceeded 15ppm threshold. Evacuation protocol standby.', severity: 'critical' },
      { id: 'A2', timestamp: new Date(Date.now() - 120000).toISOString(), zoneId: 'C2', message: 'Shift changeover initiated. 45 workers logging out.', severity: 'info' },
      { id: 'A3', timestamp: new Date(Date.now() - 3600000).toISOString(), zoneId: 'C1', message: 'Hot work permit #WP-102 activated near active flowline.', severity: 'warning' },
      { id: 'A4', timestamp: new Date(Date.now() - 7200000).toISOString(), zoneId: 'SYS', message: 'Routine diagnostic complete. All primary nodes nominal.', severity: 'info' }
    ],
    shiftChangeover: false
  };
}
