"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlantGraph = void 0;
class PlantGraph {
    zones = new Map();
    sensors = new Map();
    workers = new Map();
    permits = new Map();
    riskEvents = [];
    alerts = [];
    shiftChangeover = false;
    constructor(initialState) {
        if (initialState) {
            this.initializeFromState(initialState);
        }
    }
    initializeFromState(state) {
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
    getZone(id) {
        return this.zones.get(id);
    }
    getAllZones() {
        return Array.from(this.zones.values());
    }
    getZonesMap() {
        return this.zones;
    }
    updateZoneRisk(zoneId, riskScore, rawRiskScore) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.riskScore = riskScore;
            zone.rawRiskScore = rawRiskScore;
        }
    }
    updateZoneSafetyDebt(zoneId, safetyDebt) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.safetyDebt = safetyDebt;
        }
    }
    addWorkerToZone(workerId, zoneId) {
        const zone = this.zones.get(zoneId);
        const worker = this.workers.get(workerId);
        if (zone && worker && !zone.activeWorkers.includes(workerId)) {
            zone.activeWorkers.push(workerId);
            worker.currentZoneId = zoneId;
        }
    }
    removeWorkerFromZone(workerId, zoneId) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.activeWorkers = zone.activeWorkers.filter(id => id !== workerId);
        }
    }
    addPermitToZone(permitId, zoneId) {
        const zone = this.zones.get(zoneId);
        const permit = this.permits.get(permitId);
        if (zone && permit && !zone.activePermits.includes(permitId)) {
            zone.activePermits.push(permitId);
            permit.zoneId = zoneId;
        }
    }
    removePermitFromZone(permitId, zoneId) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.activePermits = zone.activePermits.filter(id => id !== permitId);
        }
    }
    // Sensor operations
    getSensor(id) {
        return this.sensors.get(id);
    }
    getSensorsByZone(zoneId) {
        return Array.from(this.sensors.values()).filter(s => s.zoneId === zoneId);
    }
    getAllSensors() {
        return Array.from(this.sensors.values());
    }
    updateSensor(id, value) {
        const sensor = this.sensors.get(id);
        if (sensor) {
            sensor.currentValue = value;
            sensor.lastUpdated = new Date().toISOString();
            // Update status based on thresholds
            if (value >= sensor.alarmThreshold) {
                sensor.status = 'alarm';
            }
            else if (value >= sensor.normalRange[1]) {
                sensor.status = 'elevated';
            }
            else {
                sensor.status = 'normal';
            }
        }
    }
    updateSensorStatus(id, status) {
        const sensor = this.sensors.get(id);
        if (sensor) {
            sensor.status = status;
            sensor.lastUpdated = new Date().toISOString();
        }
    }
    // Worker operations
    getWorker(id) {
        return this.workers.get(id);
    }
    getAllWorkers() {
        return Array.from(this.workers.values());
    }
    getWorkersByZone(zoneId) {
        return Array.from(this.workers.values()).filter(w => w.currentZoneId === zoneId);
    }
    moveWorker(workerId, zoneId, position, status) {
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
    updateWorkerStatus(workerId, status) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.status = status;
        }
    }
    // Permit operations
    getPermit(id) {
        return this.permits.get(id);
    }
    getAllPermits() {
        return Array.from(this.permits.values());
    }
    getPermitsByZone(zoneId) {
        return Array.from(this.permits.values()).filter(p => p.zoneId === zoneId);
    }
    addPermit(permit) {
        this.permits.set(permit.id, permit);
        this.addPermitToZone(permit.id, permit.zoneId);
    }
    updatePermitStatus(permitId, status, blockedReason) {
        const permit = this.permits.get(permitId);
        if (permit) {
            permit.status = status;
            if (blockedReason) {
                permit.blockedReason = blockedReason;
            }
        }
    }
    blockPermit(permitId, reason) {
        this.updatePermitStatus(permitId, 'blocked', reason);
    }
    // Risk Events
    addRiskEvent(event) {
        this.riskEvents.unshift(event);
        // Keep only last 1000 events
        if (this.riskEvents.length > 1000) {
            this.riskEvents = this.riskEvents.slice(0, 1000);
        }
    }
    getRiskEvents(limit = 100) {
        return this.riskEvents.slice(0, limit);
    }
    getRiskEventsByZone(zoneId, limit = 50) {
        return this.riskEvents.filter(e => e.zoneId === zoneId).slice(0, limit);
    }
    // Alerts
    addAlert(alert) {
        this.alerts.unshift(alert);
        if (this.alerts.length > 500) {
            this.alerts = this.alerts.slice(0, 500);
        }
    }
    getAlerts(limit = 50) {
        return this.alerts.slice(0, limit);
    }
    // Shift changeover
    setShiftChangeover(active) {
        this.shiftChangeover = active;
    }
    isShiftChangeover() {
        return this.shiftChangeover;
    }
    // Full state export
    getState() {
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
    getAdjacentZones(zoneId) {
        const zone = this.zones.get(zoneId);
        if (!zone)
            return [];
        return zone.adjacentZones.map(id => this.zones.get(id)).filter((z) => z !== undefined);
    }
    getZoneRiskPath(startZoneId, maxDepth = 3) {
        const visited = new Set();
        const path = [];
        const dfs = (zoneId, depth) => {
            if (depth > maxDepth || visited.has(zoneId))
                return;
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
    getZoneSensorReadings(zoneId) {
        const sensors = this.getSensorsByZone(zoneId);
        const readings = {};
        sensors.forEach(s => {
            readings[s.type] = s.currentValue;
        });
        return readings;
    }
    // Check if zone has active hot work
    hasActiveHotWork(zoneId) {
        const permits = this.getPermitsByZone(zoneId);
        return permits.some(p => p.type === 'hot_work' && p.status === 'active');
    }
    // Check if zone has confined space entry
    hasConfinedSpaceEntry(zoneId) {
        const permits = this.getPermitsByZone(zoneId);
        return permits.some(p => p.type === 'confined_space_entry' && p.status === 'active');
    }
    // Get workers in zone by role
    getWorkersInZoneByRole(zoneId, role) {
        return this.getWorkersByZone(zoneId).filter(w => w.role === role);
    }
    // Count active workers in zone
    getActiveWorkerCount(zoneId) {
        const zone = this.zones.get(zoneId);
        return zone?.activeWorkers.length || 0;
    }
    // Get all active permits in plant
    getActivePermits() {
        return this.getAllPermits().filter(p => p.status === 'active');
    }
    // Get sensors in alarm state
    getAlarmingSensors() {
        return this.getAllSensors().filter(s => s.status === 'alarm');
    }
    // Get sensors in elevated state
    getElevatedSensors() {
        return this.getAllSensors().filter(s => s.status === 'elevated');
    }
}
exports.PlantGraph = PlantGraph;
//# sourceMappingURL=PlantGraph.js.map