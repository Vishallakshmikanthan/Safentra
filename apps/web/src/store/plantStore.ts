import { create } from 'zustand';
import type { Zone, Sensor, Worker, Permit, RiskEvent, Alert } from '../types';

interface PlantState {
  zones: Record<string, Zone>;
  sensors: Record<string, Sensor>;
  workers: Record<string, Worker>;
  permits: Record<string, Permit>;
  riskEvents: RiskEvent[];
  alerts: Alert[];
  shiftChangeover: boolean;
  connectionStatus: 'connecting' | 'live' | 'offline';
  currentView: 'dashboard' | 'permits' | 'forge' | 'field' | 'live_feed' | 'sensors' | 'reports' | 'settings' | 'support';
  
  // Actions
  setCurrentView: (view: PlantState['currentView']) => void;
  updateSensor: (id: string, value: number) => void;
  addAlert: (alert: Alert) => void;
  triggerCriticalEvent: () => void;
  hydrate: (state: Partial<Pick<PlantState, 'zones' | 'sensors' | 'workers' | 'permits' | 'riskEvents' | 'alerts' | 'shiftChangeover'>>) => void;
  setConnectionStatus: (status: PlantState['connectionStatus']) => void;
}

// Initial Mock Data
const MOCK_ZONES: Record<string, Zone> = {
  'C1': { id: 'C1', name: 'Coke Oven Battery 1', type: 'coke_oven', adjacentZones: ['C2', 'C4'], hazardClass: 'A', polygon: [], riskScore: 0.1, rawRiskScore: 0.1, safetyDebt: 12, activeWorkers: ['W1', 'W2'], activePermits: [], sensors: ['S-C1-VOC'] },
  'C2': { id: 'C2', name: 'Gas Recovery', type: 'gas_holder', adjacentZones: ['C1', 'C3', 'C5'], hazardClass: 'A', polygon: [], riskScore: 0.2, rawRiskScore: 0.2, safetyDebt: 5, activeWorkers: ['W3'], activePermits: [], sensors: ['S-C2-FLW'] },
  'C3': { id: 'C3', name: 'Cooling Tower', type: 'maintenance_bay', adjacentZones: ['C2'], hazardClass: 'B', polygon: [], riskScore: 0.05, rawRiskScore: 0.05, safetyDebt: 2, activeWorkers: [], activePermits: [], sensors: [] },
  'C4': { id: 'C4', name: 'Battery 2 Underfire', type: 'coke_oven', adjacentZones: ['C1', 'C5'], hazardClass: 'A', polygon: [], riskScore: 0.92, rawRiskScore: 0.94, safetyDebt: 84, activeWorkers: ['W4', 'W5'], activePermits: ['WP-102'], sensors: ['S-C4-GAS', 'S-C4-TMP'] },
  'C5': { id: 'C5', name: 'Conveyor Transfer', type: 'conveyor', adjacentZones: ['C2', 'C4', 'C6'], hazardClass: 'B', polygon: [], riskScore: 0.15, rawRiskScore: 0.15, safetyDebt: 8, activeWorkers: [], activePermits: [], sensors: ['S-C5-PRX'] },
  'C6': { id: 'C6', name: 'By-Products Entry', type: 'entry_point', adjacentZones: ['C5'], hazardClass: 'C', polygon: [], riskScore: 0.3, rawRiskScore: 0.3, safetyDebt: 15, activeWorkers: ['W6'], activePermits: [], sensors: ['S-C6-H2S'] },
};

const MOCK_SENSORS: Record<string, Sensor> = {
  'S-C4-GAS': { id: 'S-C4-GAS', zoneId: 'C4', type: 'h2s_concentration', currentValue: 18.4, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'elevated', lastUpdated: new Date().toISOString() },
  'S-C4-TMP': { id: 'S-C4-TMP', zoneId: 'C4', type: 'temperature', currentValue: 42.1, unit: '°C', normalRange: [20, 40], alarmThreshold: 50, status: 'elevated', lastUpdated: new Date().toISOString() },
  'S-C6-H2S': { id: 'S-C6-H2S', zoneId: 'C6', type: 'h2s_concentration', currentValue: 4.2, unit: 'ppm', normalRange: [0, 10], alarmThreshold: 20, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C1-VOC': { id: 'S-C1-VOC', zoneId: 'C1', type: 'gas_pressure', currentValue: 0.1, unit: 'ppm', normalRange: [0, 5], alarmThreshold: 10, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C2-FLW': { id: 'S-C2-FLW', zoneId: 'C2', type: 'flow_rate', currentValue: 102, unit: 'L/s', normalRange: [50, 150], alarmThreshold: 200, status: 'normal', lastUpdated: new Date().toISOString() },
  'S-C5-PRX': { id: 'S-C5-PRX', zoneId: 'C5', type: 'proximity', currentValue: 0, unit: 'detected', normalRange: [0, 0], alarmThreshold: 1, status: 'normal', lastUpdated: new Date().toISOString() },
};

const MOCK_WORKERS: Record<string, Worker> = {
  'W1': { id: 'W1', name: 'A. Sharma', role: 'Operator', currentZoneId: 'C1', status: 'active', position: { x: 0, y: 0 }, shift: 'on_shift' },
  'W2': { id: 'W2', name: 'J. Doe', role: 'Technician', currentZoneId: 'C1', status: 'active', position: { x: 0, y: 0 }, shift: 'on_shift' },
  'W3': { id: 'W3', name: 'S. Singh', role: 'Operator', currentZoneId: 'C2', status: 'active', position: { x: 0, y: 0 }, shift: 'on_shift' },
  'W4': { id: 'W4', name: 'M. Patel', role: 'Welder', currentZoneId: 'C4', status: 'active', position: { x: 0, y: 0 }, shift: 'on_shift' },
  'W5': { id: 'W5', name: 'R. Kumar', role: 'Firewatch', currentZoneId: 'C4', status: 'active', position: { x: 0, y: 0 }, shift: 'on_shift' },
  'W6': { id: 'W6', name: 'T. Reddy', role: 'Supervisor', currentZoneId: 'C6', status: 'active', position: { x: 0, y: 0 }, shift: 'on_shift' },
};

const MOCK_PERMITS: Record<string, Permit> = {
  'WP-102': { id: 'WP-102', type: 'hot_work', zoneId: 'C4', requestedBy: 'M. Patel', validFrom: new Date(Date.now() - 3600000).toISOString(), validUntil: new Date(Date.now() + 7200000).toISOString(), status: 'active' },
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
  setConnectionStatus: (connectionStatus) => set({ connectionStatus })
}));

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const wsUrl = import.meta.env.VITE_WS_URL ?? apiUrl.replace(/^http/, 'ws');

/** Starts a single resilient realtime feed. The backend remains the source of truth;
 * mock values above only keep the dashboard usable while the API is unavailable. */
export function connectPlantFeed(): () => void {
  let socket: WebSocket | undefined;
  let retry: number | undefined;
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

  const open = () => {
    if (stopped) return;
    store.getState().setConnectionStatus('connecting');
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      store.getState().setConnectionStatus('live');
      socket?.send(JSON.stringify({ type: 'subscribe', payload: ['state_update', 'risk_event', 'alert'] }));
    };
    socket.onmessage = ({ data }) => {
      try {
        const message = JSON.parse(data as string);
        if (message.type === 'state_update' && message.payload) store.getState().hydrate(message.payload);
      } catch { /* Ignore malformed network frames. */ }
    };
    socket.onerror = () => socket?.close();
    socket.onclose = () => {
      store.getState().setConnectionStatus('offline');
      if (!stopped) retry = window.setTimeout(open, 2_000);
    };
  };

  void load();
  open();
  return () => {
    stopped = true;
    if (retry) window.clearTimeout(retry);
    socket?.close();
  };
}
