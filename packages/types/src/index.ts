export type ZoneType = 'coke_oven' | 'gas_holder' | 'maintenance_bay' | 'control_room' | 'entry_point' | 'conveyor';
export type SensorType = 'gas_pressure' | 'h2s_concentration' | 'co_concentration' | 'temperature' | 'oxygen_level' | 'flow_rate' | 'proximity';
export type PermitType = 'hot_work' | 'confined_space_entry' | 'electrical_isolation' | 'height_work' | 'excavation';
export type WorkerStatus = 'active' | 'in_confined_space' | 'evacuating' | 'safe';
export type PermitStatus = 'pending' | 'active' | 'blocked' | 'completed' | 'revoked';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SensorStatus = 'normal' | 'elevated' | 'alarm' | 'offline';
export type ShiftStatus = 'incoming' | 'outgoing' | 'on_shift';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  adjacentZones: string[];
  hazardClass: 'A' | 'B' | 'C';
  polygon: [number, number][];
  riskScore: number;
  rawRiskScore: number;
  safetyDebt: number;
  activeWorkers: string[];
  activePermits: string[];
  sensors: string[];
}

export interface Sensor {
  id: string;
  zoneId: string;
  type: SensorType;
  currentValue: number;
  unit: string;
  normalRange: [number, number];
  alarmThreshold: number;
  status: SensorStatus;
  lastUpdated: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  currentZoneId: string;
  status: WorkerStatus;
  position: { x: number; y: number };
  shift: ShiftStatus;
}

export interface Permit {
  id: string;
  type: PermitType;
  zoneId: string;
  requestedBy: string;
  validFrom: string;
  validUntil: string;
  status: PermitStatus;
  blockedReason?: string;
  regulatoryRef?: string;
}

export interface RiskEvent {
  id: string;
  timestamp: string;
  zoneId: string;
  riskScore: number;
  patternMatched: string;
  patternDescription: string;
  contributingFactors: string[];
  recommendedAction: string;
  severity: RiskSeverity;
}

export interface Alert {
  id: string;
  timestamp: string;
  zoneId: string;
  message: string;
  severity: AlertSeverity;
}

export interface PlantState {
  zones: Record<string, Zone>;
  sensors: Record<string, Sensor>;
  workers: Record<string, Worker>;
  permits: Record<string, Permit>;
  riskEvents: RiskEvent[];
  alerts: Alert[];
  shiftChangeover: boolean;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'state_update' | 'risk_event' | 'alert' | 'permit_blocked' | 'permit_approved' | 'worker_moved' | 'sensor_update' | 'shift_changeover' | 'safety_debt_update' | 'chaos_injected' | 'simulation_tick' | 'simulation_status';
  payload: unknown;
  timestamp: string;
}

export interface PatternResult {
  patternId: string;
  patternName: string;
  zoneId: string;
  matched: boolean;
  confidence: number;
  contributingFactors: string[];
  riskContribution: number;
}

export interface CandidatePattern {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  frequency: number;
  lastSeen: string;
  status: 'candidate' | 'validated' | 'rejected';
  sourceReports: string[];
}

export interface LedgerEntry {
  index: number;
  timestamp: string;
  type: 'risk_event' | 'permit_action' | 'worker_movement' | 'sensor_reading' | 'alert' | 'chaos_injection' | 'simulation_tick' | 'permit_blocked' | 'permit_approved' | 'shift_changeover' | 'safety_debt_update';
  payload: unknown;
  previousHash: string;
  hash: string;
}

export interface SafetyDebtMetrics {
  zoneId: string;
  currentDebt: number;
  accumulatedDebt: number;
  debtTrend: 'increasing' | 'stable' | 'decreasing';
  timeAtRisk: number;
  lastUpdated: string;
}

export interface ChaosInjection {
  id: string;
  type: 'sensor_spike' | 'worker_incapacitated' | 'permit_conflict' | 'sensor_failure' | 'zone_isolation' | 'gas_leak' | 'fire_outbreak' | 'equipment_failure';
  zoneId: string;
  parameters: Record<string, unknown>;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  injectedAt: string;
  expiresAt: string;
}

export interface PlantConfig {
  id: string;
  name: string;
  type: 'coke_oven' | 'blast_furnace' | 'sinter_plant' | 'power_plant' | 'chemical_plant';
  zones: Zone[];
  sensors: Sensor[];
  workers: Worker[];
  permits: Permit[];
  riskPatterns: string[];
  simulationScenarios: string[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  plantConfigId: string;
  events: SimulationEvent[];
  duration: number;
  expectedOutcomes: string[];
}

export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: 'sensor_change' | 'worker_move' | 'permit_request' | 'permit_approval' | 'permit_block' | 'chaos_inject' | 'shift_change' | 'alert';
  payload: unknown;
}

export interface OracleQuery {
  question: string;
  context?: {
    zoneId?: string;
    timeRange?: [string, string];
    riskEvents?: RiskEvent[];
  };
}

export interface OracleResponse {
  answer: string;
  sources: string[];
  confidence: number;
  relatedPatterns: string[];
}

export interface BlazeReport {
  incidentId: string;
  timestamp: string;
  zoneId: string;
  riskEvents: RiskEvent[];
  affectedWorkers: Worker[];
  activePermits: Permit[];
  sensorReadings: Sensor[];
  immediateActions: string[];
  evacuationRoutes: string[];
  dgfasliReport: string;
  generatedAt: string;
}

export interface ForgeSubmission {
  reportId: string;
  reporterId: string;
  timestamp: string;
  zoneId: string;
  description: string;
  severity: 'near_miss' | 'unsafe_condition' | 'unsafe_act';
  tags: string[];
}

export interface ForgeCandidate {
  pattern: CandidatePattern;
  matchedReports: ForgeSubmission[];
  confidence: number;
  suggestedPatternId: string;
}

export interface CheckpointScan {
  workerId: string;
  zoneId: string;
  permitId?: string;
  timestamp: string;
  qrCode: string;
  status: 'cleared' | 'blocked' | 'requires_escort';
  reason?: string;
}

import { WebSocket } from 'ws';

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  subscriptions: string[];
  connectedAt: string;
}

export interface SimulationState {
  running: boolean;
  currentTime: number;
  speed: number;
  scenarioId: string | null;
  events: SimulationEvent[];
  eventIndex: number;
}

export interface ChaosState {
  activeInjections: ChaosInjection[];
  history: ChaosInjection[];
}

export interface AgentStatus {
  name: string;
  status: 'idle' | 'running' | 'error';
  lastRun: string;
  lastResult?: unknown;
}