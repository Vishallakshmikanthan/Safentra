export type ZoneType = 'coke_oven' | 'gas_holder' | 'maintenance_bay' | 'control_room' | 'entry_point' | 'conveyor';
export type SensorType = 'gas_pressure' | 'h2s_concentration' | 'co_concentration' | 'temperature' | 'oxygen_level' | 'flow_rate' | 'proximity';
export type PermitType = 'hot_work' | 'confined_space_entry' | 'electrical_isolation' | 'height_work' | 'excavation';
export type WorkerStatus = 'active' | 'in_confined_space' | 'evacuating' | 'safe';

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
  status: 'normal' | 'elevated' | 'alarm' | 'offline';
  lastUpdated: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  currentZoneId: string;
  status: WorkerStatus;
  position: { x: number; y: number };
  shift: 'incoming' | 'outgoing' | 'on_shift';
}

export interface Permit {
  id: string;
  type: PermitType;
  zoneId: string;
  requestedBy: string;
  validFrom: string;
  validUntil: string;
  status: 'pending' | 'active' | 'blocked' | 'completed' | 'revoked';
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
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  timestamp: string;
  zoneId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
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

export interface ChaosState {
  activeInjections: ChaosInjection[];
  history: ChaosInjection[];
}

export interface OracleState {
  isActive: boolean;
  recommendations: string[];
  regulations: string[];
  historicalIncidents: string[];
  explanation: string;
  affectedSensors: string[];
  affectedPermits: string[];
  workersAtRisk: string[];
  confidence: number;
  sources: string[];
  conversationHistory: { role: 'user' | 'assistant'; text: string }[];
}

export interface ForgeState {
  candidates: ForgeCandidate[];
  approvalHistory: ForgeCandidate[];
  rejectionHistory: ForgeCandidate[];
}

export interface BlazeState {
  isActive: boolean;
  incidentTimeline: { time: string; description: string; status: 'completed' | 'in_progress' | 'pending' }[];
  evacuationStatus: 'none' | 'ordered' | 'in_progress' | 'completed';
  emergencyContactsNotified: string[];
  affectedWorkers: string[];
  assemblyPoints: { id: string; name: string; capacity: number; currentCount: number }[];
  incidentReport: string | null;
  actionChecklist: { id: string; description: string; completed: boolean }[];
  resourceAllocation: { resource: string; status: 'dispatched' | 'arrived' | 'en_route' }[];
  responseStatus: string;
  countdownTimer: number | null;
}
