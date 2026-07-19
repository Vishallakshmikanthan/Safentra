import { create } from 'zustand';
import type { Zone, Sensor, Worker, Permit, RiskEvent, Alert, OracleState, ForgeState, BlazeState, ChaosState } from '../types';

interface PlantState {
  zones: Record<string, Zone>;
  sensors: Record<string, Sensor>;
  workers: Record<string, Worker>;
  permits: Record<string, Permit>;
  riskEvents: RiskEvent[];
  alerts: Alert[];
  shiftChangeover: boolean;
  connectionStatus: 'connecting' | 'live' | 'offline';
  currentView: 'dashboard' | 'permits' | 'forge' | 'field' | 'live_feed' | 'sensors' | 'reports' | 'settings' | 'support' | 'oracle' | 'blaze' | 'chaos';

  // â”€â”€â”€ Danger Mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  dangerMode: boolean;
  simulationMode: 'normal' | 'danger_active' | 'returning_to_normal';
  dangerElapsedSeconds: number;

  // â”€â”€â”€ AI Agent States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  oracleState: OracleState;
  forgeState: ForgeState;
  blazeState: BlazeState;
  chaosState: ChaosState;
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // Actions
  setCurrentView: (view: PlantState['currentView']) => void;
  updateSensor: (id: string, value: number) => void;
  addAlert: (alert: Alert) => void;
  triggerCriticalEvent: () => void;
  hydrate: (state: Partial<Pick<PlantState, 'zones' | 'sensors' | 'workers' | 'permits' | 'riskEvents' | 'alerts' | 'shiftChangeover'>>) => void;
  setConnectionStatus: (status: PlantState['connectionStatus']) => void;
  setDangerMode: (active: boolean) => void;
  setSimulationMode: (mode: PlantState['simulationMode']) => void;
  setDangerElapsed: (seconds: number) => void;
  incrementDangerElapsed: () => void;
  resetDangerElapsed: () => void;

  setOracleState: (state: Partial<OracleState>) => void;
  setForgeState: (state: Partial<ForgeState>) => void;
  setBlazeState: (state: Partial<BlazeState>) => void;
  setChaosState: (state: Partial<ChaosState>) => void;
}

// Initial Mock Data
const MOCK_ZONES: Record<string, Zone> = {
  'C1': { id: 'C1', name: 'Coke Oven Battery 1', type: 'coke_oven', adjacentZones: ['C2', 'C3'], hazardClass: 'A', polygon: [[100, 100], [300, 100], [300, 250], [100, 250]], riskScore: 0.1, rawRiskScore: 0.1, safetyDebt: 12, activeWorkers: ['worker-1', 'worker-6'], activePermits: ['permit-1'], sensors: ['S-C1-VOC', 'S-C1-H2S', 'S-C1-CO', 'S-C1-TMP'] },
  'C2': { id: 'C2', name: 'Coke Oven Battery 2', type: 'coke_oven', adjacentZones: ['C1', 'C4'], hazardClass: 'A', polygon: [[350, 100], [550, 100], [550, 250], [350, 250]], riskScore: 0.2, rawRiskScore: 0.2, safetyDebt: 5, activeWorkers: ['worker-2'], activePermits: [], sensors: ['S-C2-GAS', 'S-C2-H2S', 'S-C2-CO', 'S-C2-TMP'] },
  'C3': { id: 'C3', name: 'Gas Holder', type: 'gas_holder', adjacentZones: ['C1', 'C5'], hazardClass: 'A', polygon: [[100, 300], [300, 300], [300, 450], [100, 450]], riskScore: 0.05, rawRiskScore: 0.05, safetyDebt: 2, activeWorkers: ['worker-7'], activePermits: ['permit-2'], sensors: ['S-C3-GAS', 'S-C3-H2S', 'S-C3-O2'] },
  'C4': { id: 'C4', name: 'Maintenance Bay', type: 'maintenance_bay', adjacentZones: ['C2', 'C6'], hazardClass: 'B', polygon: [[350, 300], [550, 300], [550, 450], [350, 450]], riskScore: 0.92, rawRiskScore: 0.94, safetyDebt: 84, activeWorkers: ['worker-3'], activePermits: ['permit-3'], sensors: ['S-C4-GAS', 'S-C4-TMP'] },
  'C5': { id: 'C5', name: 'Control Room', type: 'control_room', adjacentZones: ['C3', 'C6'], hazardClass: 'C', polygon: [[100, 500], [300, 500], [300, 600], [100, 600]], riskScore: 0.15, rawRiskScore: 0.15, safetyDebt: 8, activeWorkers: ['worker-4'], activePermits: [], sensors: ['S-C5-O2'] },
  'C6': { id: 'C6', name: 'Entry Point', type: 'entry_point', adjacentZones: ['C4', 'C5'], hazardClass: 'B', polygon: [[350, 500], [550, 500], [550, 600], [350, 600]], riskScore: 0.3, rawRiskScore: 0.3, safetyDebt: 15, activeWorkers: ['worker-5'], activePermits: [], sensors: ['S-C5-PRX', 'S-C6-FLW'] },
};

const MOCK_SENSORS: Record<string, Sensor> = {
  'S-C1-VOC': { id: 'S-C1-VOC', zoneId: 'C1', type: 'gas_pressure', currentValue: 1.2, unit: 'bar', normalRange: [1.0, 1.5], alarmThreshold: 2.0, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C1-H2S': { id: 'S-C1-H2S', zoneId: 'C1', type: 'h2s_concentration', currentValue: 5, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C1-CO': { id: 'S-C1-CO', zoneId: 'C1', type: 'co_concentration', currentValue: 15, unit: 'ppm', normalRange: [0, 25], alarmThreshold: 50, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C1-TMP': { id: 'S-C1-TMP', zoneId: 'C1', type: 'temperature', currentValue: 45, unit: '°C', normalRange: [30, 60], alarmThreshold: 80, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C2-GAS': { id: 'S-C2-GAS', zoneId: 'C2', type: 'gas_pressure', currentValue: 1.1, unit: 'bar', normalRange: [1.0, 1.5], alarmThreshold: 2.0, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C2-H2S': { id: 'S-C2-H2S', zoneId: 'C2', type: 'h2s_concentration', currentValue: 3, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C2-CO': { id: 'S-C2-CO', zoneId: 'C2', type: 'co_concentration', currentValue: 10, unit: 'ppm', normalRange: [0, 25], alarmThreshold: 50, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C2-TMP': { id: 'S-C2-TMP', zoneId: 'C2', type: 'temperature', currentValue: 42, unit: '°C', normalRange: [30, 60], alarmThreshold: 80, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C3-GAS': { id: 'S-C3-GAS', zoneId: 'C3', type: 'gas_pressure', currentValue: 0.8, unit: 'bar', normalRange: [0.5, 1.2], alarmThreshold: 1.5, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C3-H2S': { id: 'S-C3-H2S', zoneId: 'C3', type: 'h2s_concentration', currentValue: 2, unit: 'ppm', normalRange: [0, 5], alarmThreshold: 15, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C3-O2': { id: 'S-C3-O2', zoneId: 'C3', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C4-GAS': { id: 'S-C4-GAS', zoneId: 'C4', type: 'h2s_concentration', currentValue: 18.4, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'elevated', lastUpdated: new Date().toISOString() },
  'S-C4-TMP': { id: 'S-C4-TMP', zoneId: 'C4', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C5-O2': { id: 'S-C5-O2', zoneId: 'C5', type: 'oxygen_level', currentValue: 20.9, unit: '%', normalRange: [19.5, 23.5], alarmThreshold: 19.0, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C5-PRX': { id: 'S-C5-PRX', zoneId: 'C6', type: 'proximity', currentValue: 0, unit: 'm', normalRange: [0, 2], alarmThreshold: 0.5, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C6-FLW': { id: 'S-C6-FLW', zoneId: 'C6', type: 'flow_rate', currentValue: 100, unit: 'm³/h', normalRange: [80, 120], alarmThreshold: 150, status: 'normal', lastUpdated: new Date().toISOString() },
};

const MOCK_WORKERS: Record<string, Worker> = {
  'worker-1': { id: 'worker-1', name: 'Rajesh Kumar', role: 'Operator', currentZoneId: 'C1', status: 'active', position: { x: 150, y: 150 }, shift: 'on_shift' },
  'worker-2': { id: 'worker-2', name: 'Priya Sharma', role: 'Supervisor', currentZoneId: 'C2', status: 'active', position: { x: 400, y: 150 }, shift: 'on_shift' },
  'worker-3': { id: 'worker-3', name: 'Amit Singh', role: 'Maintenance', currentZoneId: 'C4', status: 'active', position: { x: 400, y: 350 }, shift: 'on_shift' },
  'worker-4': { id: 'worker-4', name: 'Sunita Devi', role: 'Control Room Operator', currentZoneId: 'C5', status: 'active', position: { x: 150, y: 550 }, shift: 'on_shift' },
  'worker-5': { id: 'worker-5', name: 'Vikram Patel', role: 'Safety Officer', currentZoneId: 'C6', status: 'active', position: { x: 400, y: 550 }, shift: 'on_shift' },
  'worker-6': { id: 'worker-6', name: 'Deepak Verma', role: 'Operator', currentZoneId: 'C1', status: 'active', position: { x: 200, y: 200 }, shift: 'incoming' },
  'worker-7': { id: 'worker-7', name: 'Meera Joshi', role: 'Operator', currentZoneId: 'C3', status: 'active', position: { x: 150, y: 350 }, shift: 'outgoing' }
};

const MOCK_PERMITS: Record<string, Permit> = {
  'permit-1': { id: 'permit-1', type: 'hot_work', zoneId: 'C1', requestedBy: 'worker-1', validFrom: new Date(Date.now() - 3600000).toISOString(), validUntil: new Date(Date.now() + 7200000).toISOString(), status: 'active' },
  'permit-2': { id: 'permit-2', type: 'confined_space_entry', zoneId: 'C3', requestedBy: 'worker-3', validFrom: new Date(Date.now() - 1800000).toISOString(), validUntil: new Date(Date.now() + 5400000).toISOString(), status: 'active' },
  'permit-3': { id: 'permit-3', type: 'electrical_isolation', zoneId: 'C4', requestedBy: 'worker-3', validFrom: new Date(Date.now() - 7200000).toISOString(), validUntil: new Date(Date.now() + 10800000).toISOString(), status: 'active' },
};

const MOCK_ALERTS: Alert[] = [
  { id: 'A1', timestamp: new Date(Date.now() - 5000).toISOString(), zoneId: 'C4', message: 'H2S concentration exceeded 15ppm threshold. Evacuation protocol standby.', severity: 'critical' },
  { id: 'A2', timestamp: new Date(Date.now() - 120000).toISOString(), zoneId: 'C2', message: 'Shift changeover initiated. 45 workers logging out.', severity: 'info' },
  { id: 'A3', timestamp: new Date(Date.now() - 3600000).toISOString(), zoneId: 'C1', message: 'Hot work permit #WP-102 activated near active flowline.', severity: 'warning' },
  { id: 'A4', timestamp: new Date(Date.now() - 7200000).toISOString(), zoneId: 'SYS', message: 'Routine diagnostic complete. All primary nodes nominal.', severity: 'info' },
];

export const usePlantStore = create<PlantState>((set) => ({
  zones: MOCK_ZONES,
  sensors: MOCK_SENSORS,
  workers: MOCK_WORKERS,
  permits: MOCK_PERMITS,
  riskEvents: [],
  alerts: MOCK_ALERTS,
  shiftChangeover: true,
  connectionStatus: 'connecting',
  currentView: 'dashboard',
  dangerMode: false,
  simulationMode: 'normal',
  dangerElapsedSeconds: 0,

  oracleState: { 
    isActive: true, 
    recommendations: ['Secondary gas test is mandatory before resumption of hot work.', 'Ventilation systems should be switched to negative pressure mode.', 'Evacuate Zone C4 immediately.'], 
    regulations: ['OISD-GDN-169', 'PTW-2023-1142'], 
    historicalIncidents: ['Minor H2S spikes at Sensor Node 4A correlated with venting operations.'], 
    explanation: 'Analysis indicates three minor H2S spikes (peaking at 12ppm) at Sensor Node 4A over the past 48 hours. These readings correlate temporally with venting operations conducted by Maintenance Crew Alpha. There is currently one active Hot Work permit (PTW-2023-1142) issued within a 50-meter radius for pipe section replacement.', 
    affectedSensors: ['NODE-4A', 'S-C4-GAS'], 
    affectedPermits: ['PTW-2023-1142'], 
    workersAtRisk: ['worker-3 (Amit Singh)'], 
    confidence: 0.94, 
    sources: ['NODE-4A-LOG', 'PTW-2023-1142', 'OISD-GDN-169'], 
    conversationHistory: [] 
  },
  forgeState: { 
    candidates: [{
      id: 'FC-01',
      pattern: {
        id: 'P-NEW',
        name: 'Confined Space + High Temp + Work Permit',
        description: 'Worker in confined space with rising ambient temperature and active hot work permit nearby.',
        severity: 'high',
        conditions: ['Zone type is confined_space', 'Temperature trend is rising > 2deg/min', 'Adjacent zone has active hot_work permit'],
        lastSeen: new Date().toISOString()
      },
      suggestedPatternId: 'RULE-045',
      confidence: 0.88
    }], 
    approvalHistory: [], 
    rejectionHistory: [] 
  },
  blazeState: { 
    isActive: true, 
    incidentTimeline: [
      { timestamp: new Date(Date.now() - 120000).toISOString(), message: 'BEGIN TRANSMISSION' },
      { timestamp: new Date(Date.now() - 110000).toISOString(), message: 'ERR: THERMAL RUNAWAY DETECTED. Sensor array #402 offline. Last recorded temp: 450°C. Rate of climb exceeds safety thresholds.' },
      { timestamp: new Date(Date.now() - 100000).toISOString(), message: 'SYS.INIT(BLAZE_PROTOCOL)' },
      { timestamp: new Date(Date.now() - 90000).toISOString(), message: 'Containment doors closing... FAILED. Obstruction reported in Corridor B.' },
      { timestamp: new Date(Date.now() - 80000).toISOString(), message: 'Ventilation systems switching to negative pressure mode... OK.' },
      { timestamp: new Date(Date.now() - 70000).toISOString(), message: 'END OF LOG APPEND. AWAITING MANUAL OVERRIDE.' }
    ], 
    evacuationStatus: 'in_progress', 
    emergencyContactsNotified: ['Facility Director', 'Local Fire Dept HQ'], 
    affectedWorkers: ['worker-3', 'worker-4'], 
    assemblyPoints: ['Assembly Point Alpha'], 
    incidentReport: null, 
    actionChecklist: ['Immediate Total Evacuation - Zone Alpha', 'Secure & Standby - Zone Beta', 'Lockdown Authorized Personnel Only - Perimeter Gates'], 
    resourceAllocation: [], 
    responseStatus: 'ACTIVE', 
    countdownTimer: '00:00' 
  },
  chaosState: { 
    activeInjections: [{
      id: 'INJ-01',
      type: 'sensor_failure',
      target: 'S-C1-TMP',
      startTime: new Date().toISOString(),
      status: 'active'
    }], 
    history: [] 
  },

  setCurrentView: (view) => set({ currentView: view }),

  updateSensor: (id, value) => set((state) => ({
    sensors: {
      ...state.sensors,
      [id]: { ...state.sensors[id], currentValue: value, lastUpdated: new Date().toISOString() }
    }
  })),

  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts]
  })),

  triggerCriticalEvent: () => set((state) => {
    const newAlert: Alert = {
      id: `A-${Date.now()}`,
      timestamp: new Date().toISOString(),
      zoneId: 'C4',
      message: 'COMPOUND CRITICALITY DETECTED: Gas elevation + Shift changeover + Hot work in Zone C4.',
      severity: 'critical'
    };
    return {
      alerts: [newAlert, ...state.alerts]
    };
  }),

  hydrate: (state) => set(state),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  // â”€â”€â”€ Danger Mode Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  setDangerMode: (active) => set({ dangerMode: active }),
  setSimulationMode: (mode) => set({ simulationMode: mode }),
  setDangerElapsed: (seconds) => set({ dangerElapsedSeconds: seconds }),
  incrementDangerElapsed: () => set((state) => ({ dangerElapsedSeconds: state.dangerElapsedSeconds + 1 })),
  resetDangerElapsed: () => set({ dangerElapsedSeconds: 0 }),
  
  setOracleState: (state) => set((s) => ({ oracleState: { ...s.oracleState, ...state } })),
  setForgeState: (state) => set((s) => ({ forgeState: { ...s.forgeState, ...state } })),
  setBlazeState: (state) => set((s) => ({ blazeState: { ...s.blazeState, ...state } })),
  setChaosState: (state) => set((s) => ({ chaosState: { ...s.chaosState, ...state } })),
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
}));


const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const wsUrl = import.meta.env.VITE_WS_URL ?? apiUrl.replace(/^http/, 'ws');

/** Starts a single resilient realtime feed. The backend remains the source of truth;
 * mock values above only keep the dashboard usable while the API is unavailable. */
export function connectPlantFeed(): () => void {
  let socket: WebSocket | undefined;
  let retry: number | undefined;
  let elapsedInterval: number | undefined;
  let stopped = false;
  const store = usePlantStore;

  const load = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/state`);
      if (!response.ok) throw new Error('State request failed');
      store.getState().hydrate(await response.json());
    } catch {
      store.getState().setConnectionStatus('offline');
    }
  };

  const startElapsedCounter = () => {
    if (elapsedInterval) return;
    elapsedInterval = window.setInterval(() => {
      store.getState().incrementDangerElapsed();
    }, 1000);
  };

  const stopElapsedCounter = () => {
    if (elapsedInterval) {
      window.clearInterval(elapsedInterval);
      elapsedInterval = undefined;
    }
  };

  const open = () => {
    if (stopped) return;
    store.getState().setConnectionStatus('connecting');
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      store.getState().setConnectionStatus('live');
      socket?.send(JSON.stringify({ type: 'subscribe', payload: ['state_update', 'risk_event', 'alert', 'simulation_status', 'simulation_tick', 'oracle_update', 'forge_candidate', 'blaze_update', 'chaos_update'] }));
    };
    socket.onmessage = ({ data }) => {
      try {
        const message = JSON.parse(data as string);

        if (message.type === 'state_update' && message.payload) {
          store.getState().hydrate(message.payload);
        }

        if (message.type === 'simulation_status' && message.payload) {
          const { mode, dangerMode } = message.payload;
          if (mode === 'danger' || dangerMode === true) {
            store.getState().setDangerMode(true);
            store.getState().setSimulationMode('danger_active');
            store.getState().resetDangerElapsed();
            startElapsedCounter();
          } else {
            store.getState().setDangerMode(false);
            store.getState().setSimulationMode('returning_to_normal');
            stopElapsedCounter();
            store.getState().resetDangerElapsed();
            // After ~25s (recovery time) flip back to 'normal'
            window.setTimeout(() => {
              store.getState().setSimulationMode('normal');
            }, 25_000);
          }
        }

        if (message.type === 'simulation_tick' && message.payload) {
          const { dangerMode, dangerElapsedSeconds } = message.payload;
          if (typeof dangerMode === 'boolean') {
            const current = store.getState().dangerMode;
            if (current !== dangerMode) {
              store.getState().setDangerMode(dangerMode);
            }
          }
          if (typeof dangerElapsedSeconds === 'number' && store.getState().dangerMode) {
            store.getState().setDangerElapsed(dangerElapsedSeconds);
          }
        }

        if (message.type === 'risk_event' && message.payload) {
          const event = message.payload;
          const alert = {
            id: `risk-${event.id ?? Date.now()}`,
            timestamp: event.timestamp ?? new Date().toISOString(),
            zoneId: event.zoneId ?? 'SYS',
            message: event.patternDescription ?? `Risk event: ${event.patternMatched}`,
            severity: event.severity === 'critical' ? 'critical' as const
              : event.severity === 'high' ? 'warning' as const
              : 'info' as const,
          };
          store.getState().addAlert(alert);
        }

        if (message.type === 'oracle_update' && message.payload) {
          store.getState().setOracleState(message.payload);
        }
        if (message.type === 'forge_candidate' && message.payload) {
          store.getState().setForgeState(message.payload);
        }
        if (message.type === 'blaze_update' && message.payload) {
          store.getState().setBlazeState(message.payload);
        }
        if (message.type === 'chaos_update' && message.payload) {
          store.getState().setChaosState(message.payload);
        }

      } catch { /* Ignore malformed network frames. */ }
    };
    socket.onerror = () => socket?.close();
    socket.onclose = () => {
      store.getState().setConnectionStatus('offline');
      if (!stopped) retry = window.setTimeout(open, 2_000);
    };
  };

  let mockAlertInterval: number | undefined;

  const startMockAlerts = () => {
    if (mockAlertInterval) return;
    mockAlertInterval = window.setInterval(() => {
      if (store.getState().connectionStatus !== 'live') {
        const severityOptions = ['info', 'warning', 'critical'] as const;
        const severity = severityOptions[Math.floor(Math.random() * severityOptions.length)];
        const zoneOptions = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'SYS'];
        const zoneId = zoneOptions[Math.floor(Math.random() * zoneOptions.length)];
        const alert = {
          id: `A-MOCK-${Date.now()}`,
          timestamp: new Date().toISOString(),
          zoneId,
          message: `Simulated ${severity} event detected in zone ${zoneId}.`,
          severity
        };
        store.getState().addAlert(alert);
      }
    }, 8000);
  };

  void load();
  open();
  startMockAlerts();
  
  return () => {
    stopped = true;
    if (retry) window.clearTimeout(retry);
    if (mockAlertInterval) window.clearInterval(mockAlertInterval);
    stopElapsedCounter();
    socket?.close();
  };
}
