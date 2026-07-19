import { Zone, Sensor, Worker, Permit, SensorType, ZoneType, PermitType, WorkerStatus, PlantState, RiskEvent, Alert } from '@safentra/types';
import { v4 as uuidv4 } from 'uuid';

export class PlantGraph {
  private zones: Map<string, Zone> = new Map();
  private sensors: Map<string, Sensor> = new Map();
  private workers: Map<string, Worker> = new Map();
  private permits: Map<string, Permit> = new Map();
  private riskEvents: RiskEvent[] = [];
  private alerts: Alert[] = [];
  private shiftChangeover: boolean = false;

  constructor(initialState?: Partial<PlantState>) {
    if (initialState) {
      this.initializeFromState(initialState);
    }
  }

  private initializeFromState(state: Partial<PlantState>): void {
    if (state.zones) {
      Object.values(state.zones).forEach(zone => this.zones.set(zone.id, zone));
    }
    if (state.sensors) {
      Object.values(state.sensors).forEach(sensor => this.sensors.set(sensor.id, sensor));
    }
    if (state.workers) {
      Object.values(state.workers).forEach(worker => this.workers.set(worker.id, worker));
    }
    if (state.permits) {
      Object.values(state.permits).forEach(permit => this.permits.set(permit.id, permit));
    }
    if (state.riskEvents) {
      this.riskEvents = state.riskEvents;
    }
    if (state.alerts) {
      this.alerts = state.alerts;
    }
    if (state.shiftChangeover !== undefined) {
      this.shiftChangeover = state.shiftChangeover;
    }
  }

  // Zone operations
  getZone(id: string): Zone | undefined {
    return this.zones.get(id);
  }

  getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  getZonesMap(): Map<string, Zone> {
    return this.zones;
  }

  updateZoneRisk(zoneId: string, riskScore: number, rawRiskScore: number): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.riskScore = riskScore;
      zone.rawRiskScore = rawRiskScore;
    }
  }

  updateZoneSafetyDebt(zoneId: string, safetyDebt: number): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.safetyDebt = safetyDebt;
    }
  }

  addWorkerToZone(workerId: string, zoneId: string): void {
    const zone = this.zones.get(zoneId);
    const worker = this.workers.get(workerId);
    if (zone && worker && !zone.activeWorkers.includes(workerId)) {
      zone.activeWorkers.push(workerId);
      worker.currentZoneId = zoneId;
    }
  }

  removeWorkerFromZone(workerId: string, zoneId: string): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.activeWorkers = zone.activeWorkers.filter(id => id !== workerId);
    }
  }

  addPermitToZone(permitId: string, zoneId: string): void {
    const zone = this.zones.get(zoneId);
    const permit = this.permits.get(permitId);
    if (zone && permit && !zone.activePermits.includes(permitId)) {
      zone.activePermits.push(permitId);
      permit.zoneId = zoneId;
    }
  }

  removePermitFromZone(permitId: string, zoneId: string): void {
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.activePermits = zone.activePermits.filter(id => id !== permitId);
    }
  }

  // Sensor operations
  getSensor(id: string): Sensor | undefined {
    return this.sensors.get(id);
  }

  getSensorsByZone(zoneId: string): Sensor[] {
    return Array.from(this.sensors.values()).filter(s => s.zoneId === zoneId);
  }

  getAllSensors(): Sensor[] {
    return Array.from(this.sensors.values());
  }

  updateSensor(id: string, value: number): void {
    const sensor = this.sensors.get(id);
    if (sensor) {
      sensor.currentValue = value;
      sensor.lastUpdated = new Date().toISOString();
      
      // Update status based on thresholds
      if (value >= sensor.alarmThreshold) {
        sensor.status = 'alarm';
      } else if (value >= sensor.normalRange[1]) {
        sensor.status = 'elevated';
      } else {
        sensor.status = 'normal';
      }
    }
  }

  updateSensorStatus(id: string, status: Sensor['status']): void {
    const sensor = this.sensors.get(id);
    if (sensor) {
      sensor.status = status;
      sensor.lastUpdated = new Date().toISOString();
    }
  }

  // Worker operations
  getWorker(id: string): Worker | undefined {
    return this.workers.get(id);
  }

  getAllWorkers(): Worker[] {
    return Array.from(this.workers.values());
  }

  getWorkersByZone(zoneId: string): Worker[] {
    return Array.from(this.workers.values()).filter(w => w.currentZoneId === zoneId);
  }

  moveWorker(workerId: string, zoneId: string, position: { x: number; y: number }, status: WorkerStatus): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      // Remove from old zone
      const oldZone = this.zones.get(worker.currentZoneId);
      if (oldZone) {
        oldZone.activeWorkers = oldZone.activeWorkers.filter(id => id !== workerId);
      }
      
      // Add to new zone
      worker.currentZoneId = zoneId;
      worker.position = position;
      worker.status = status;
      
      const newZone = this.zones.get(zoneId);
      if (newZone && !newZone.activeWorkers.includes(workerId)) {
        newZone.activeWorkers.push(workerId);
      }
    }
  }

  updateWorkerStatus(workerId: string, status: WorkerStatus): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.status = status;
    }
  }

  // Permit operations
  getPermit(id: string): Permit | undefined {
    return this.permits.get(id);
  }

  getAllPermits(): Permit[] {
    return Array.from(this.permits.values());
  }

  getPermitsByZone(zoneId: string): Permit[] {
    return Array.from(this.permits.values()).filter(p => p.zoneId === zoneId);
  }

  addPermit(permit: Permit): void {
    this.permits.set(permit.id, permit);
    this.addPermitToZone(permit.id, permit.zoneId);
  }

  updatePermitStatus(permitId: string, status: Permit['status'], blockedReason?: string): void {
    const permit = this.permits.get(permitId);
    if (permit) {
      permit.status = status;
      if (blockedReason) {
        permit.blockedReason = blockedReason;
      }
    }
  }

  blockPermit(permitId: string, reason: string): void {
    this.updatePermitStatus(permitId, 'blocked', reason);
  }

  // Risk Events
  addRiskEvent(event: RiskEvent): void {
    this.riskEvents.unshift(event);
    // Keep only last 1000 events
    if (this.riskEvents.length > 1000) {
      this.riskEvents = this.riskEvents.slice(0, 1000);
    }
  }

  getRiskEvents(limit = 100): RiskEvent[] {
    return this.riskEvents.slice(0, limit);
  }

  getRiskEventsByZone(zoneId: string, limit = 50): RiskEvent[] {
    return this.riskEvents.filter(e => e.zoneId === zoneId).slice(0, limit);
  }

  // Alerts
  addAlert(alert: Alert): void {
    this.alerts.unshift(alert);
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(0, 500);
    }
  }

  getAlerts(limit = 50): Alert[] {
    return this.alerts.slice(0, limit);
  }

  // Shift changeover
  setShiftChangeover(active: boolean): void {
    this.shiftChangeover = active;
  }

  isShiftChangeover(): boolean {
    return this.shiftChangeover;
  }

  // Full state export
  getState(): PlantState {
    return {
      zones: Object.fromEntries(this.zones),
      sensors: Object.fromEntries(this.sensors),
      workers: Object.fromEntries(this.workers),
      permits: Object.fromEntries(this.permits),
      riskEvents: this.riskEvents,
      alerts: this.alerts,
      shiftChangeover: this.shiftChangeover,
      timestamp: new Date().toISOString()
    };
  }

  // Zone adjacency and graph operations
  getAdjacentZones(zoneId: string): Zone[] {
    const zone = this.zones.get(zoneId);
    if (!zone) return [];
    return zone.adjacentZones.map(id => this.zones.get(id)).filter((z): z is Zone => z !== undefined);
  }

  getZoneRiskPath(startZoneId: string, maxDepth = 3): Zone[] {
    const visited = new Set<string>();
    const path: Zone[] = [];
    
    const dfs = (zoneId: string, depth: number) => {
      if (depth > maxDepth || visited.has(zoneId)) return;
      visited.add(zoneId);
      const zone = this.zones.get(zoneId);
      if (zone) {
        path.push(zone);
        zone.adjacentZones.forEach(adjId => dfs(adjId, depth + 1));
      }
    };
    
    dfs(startZoneId, 0);
    return path;
  }

  // Sensor readings for a zone
  getZoneSensorReadings(zoneId: string): Record<string, number> {
    const sensors = this.getSensorsByZone(zoneId);
    const readings: Record<string, number> = {};
    sensors.forEach(s => {
      readings[s.type] = s.currentValue;
    });
    return readings;
  }

  // Check if zone has active hot work
  hasActiveHotWork(zoneId: string): boolean {
    const permits = this.getPermitsByZone(zoneId);
    return permits.some(p => p.type === 'hot_work' && p.status === 'active');
  }

  // Check if zone has confined space entry
  hasConfinedSpaceEntry(zoneId: string): boolean {
    const permits = this.getPermitsByZone(zoneId);
    return permits.some(p => p.type === 'confined_space_entry' && p.status === 'active');
  }

  // Get workers in zone by role
  getWorkersInZoneByRole(zoneId: string, role: string): Worker[] {
    return this.getWorkersByZone(zoneId).filter(w => w.role === role);
  }

  // Count active workers in zone
  getActiveWorkerCount(zoneId: string): number {
    const zone = this.zones.get(zoneId);
    return zone?.activeWorkers.length || 0;
  }

  // Get all active permits in plant
  getActivePermits(): Permit[] {
    return this.getAllPermits().filter(p => p.status === 'active');
  }

  // Get sensors in alarm state
  getAlarmingSensors(): Sensor[] {
    return this.getAllSensors().filter(s => s.status === 'alarm');
  }

  // Get sensors in elevated state
  getElevatedSensors(): Sensor[] {
    return this.getAllSensors().filter(s => s.status === 'elevated');
  }
}