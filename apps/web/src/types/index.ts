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
