"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyDebt = void 0;
class SafetyDebt {
    debtHistory = new Map();
    maxHistoryLength = 100; // Keep last 100 readings
    debtAccumulationRate = 0.5; // Debt accumulates per tick when risk > 0
    debtDecayRate = 0.02; // Debt decays per tick when risk = 0
    timeAtRisk = new Map(); // Seconds at elevated risk
    updateDebt(zone, riskScore, tickIntervalMs = 500) {
        const zoneId = zone.id;
        let currentDebt = zone.safetyDebt;
        let accumulatedDebt = currentDebt;
        let timeAtRisk = this.timeAtRisk.get(zoneId) ?? 0;
        // Update time at risk
        if (riskScore > 0.3) {
            timeAtRisk += tickIntervalMs / 1000; // Convert to seconds
        }
        else {
            timeAtRisk = Math.max(0, timeAtRisk - tickIntervalMs / 1000);
        }
        this.timeAtRisk.set(zoneId, timeAtRisk);
        // Accumulate or decay debt
        if (riskScore > 0.3) {
            // Debt accumulates proportionally to risk score
            currentDebt += this.debtAccumulationRate * riskScore;
        }
        else {
            // Debt decays slowly when risk is low
            currentDebt = Math.max(0, currentDebt - this.debtDecayRate);
        }
        // Cap debt at 100
        currentDebt = Math.min(currentDebt, 100);
        accumulatedDebt = currentDebt;
        // Store in history
        const history = this.debtHistory.get(zoneId) ?? [];
        history.push(currentDebt);
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
        this.debtHistory.set(zoneId, history);
        // Determine trend
        let debtTrend = 'stable';
        if (history.length >= 5) {
            const recent = history.slice(-5);
            const first = recent[0];
            const last = recent[recent.length - 1];
            const change = last - first;
            if (change > 1)
                debtTrend = 'increasing';
            else if (change < -1)
                debtTrend = 'decreasing';
        }
        return {
            zoneId,
            currentDebt: Math.round(currentDebt * 100) / 100,
            accumulatedDebt: Math.round(accumulatedDebt * 100) / 100,
            debtTrend,
            timeAtRisk: Math.round(timeAtRisk),
            lastUpdated: new Date().toISOString()
        };
    }
    getDebtHistory(zoneId) {
        return this.debtHistory.get(zoneId) ?? [];
    }
    getTimeAtRisk(zoneId) {
        return this.timeAtRisk.get(zoneId) ?? 0;
    }
    // Get debt metrics for all zones
    getAllDebtMetrics(zones, riskScores) {
        return zones.map(zone => {
            const history = this.debtHistory.get(zone.id) ?? [];
            const recent = history.slice(-5);
            const change = recent.length >= 2 ? recent.at(-1) - recent[0] : 0;
            return {
                zoneId: zone.id,
                currentDebt: Math.round(zone.safetyDebt * 100) / 100,
                accumulatedDebt: Math.round(zone.safetyDebt * 100) / 100,
                debtTrend: change > 1 ? 'increasing' : change < -1 ? 'decreasing' : 'stable',
                timeAtRisk: Math.round(this.timeAtRisk.get(zone.id) ?? 0),
                lastUpdated: new Date().toISOString()
            };
        });
    }
    // Reset debt for a zone (e.g., after safety stand-down)
    resetDebt(zoneId) {
        this.debtHistory.set(zoneId, []);
        this.timeAtRisk.set(zoneId, 0);
    }
    // Get plant-wide debt summary
    getPlantDebtSummary(zones) {
        const debts = zones.map(z => z.safetyDebt);
        const totalDebt = debts.reduce((sum, d) => sum + d, 0);
        const averageDebt = debts.length > 0 ? totalDebt / debts.length : 0;
        const zonesAtRisk = debts.filter(d => d > 30).length;
        const criticalZones = zones.filter(z => z.safetyDebt > 70).map(z => z.id);
        return {
            totalDebt: Math.round(totalDebt * 100) / 100,
            averageDebt: Math.round(averageDebt * 100) / 100,
            zonesAtRisk,
            criticalZones
        };
    }
}
exports.SafetyDebt = SafetyDebt;
//# sourceMappingURL=SafetyDebt.js.map