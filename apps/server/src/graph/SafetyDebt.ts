import { Zone, SafetyDebtMetrics } from '@safentra/types';

export class SafetyDebt {
  private debtHistory: Map<string, number[]> = new Map();
  private maxHistoryLength = 100; // Keep last 100 readings
  private debtAccumulationRate = 0.5; // Debt accumulates per tick when risk > 0
  private debtDecayRate = 0.02; // Debt decays per tick when risk = 0
  private timeAtRisk: Map<string, number> = new Map(); // Seconds at elevated risk

  updateDebt(zone: Zone, riskScore: number, tickIntervalMs: number = 500): SafetyDebtMetrics {
    const zoneId = zone.id;
    let currentDebt = zone.safetyDebt;
    let accumulatedDebt = currentDebt;
    let timeAtRisk = this.timeAtRisk.get(zoneId) ?? 0;

    // Update time at risk
    if (riskScore > 0.3) {
      timeAtRisk += tickIntervalMs / 1000; // Convert to seconds
    } else {
      timeAtRisk = Math.max(0, timeAtRisk - tickIntervalMs / 1000);
    }
    this.timeAtRisk.set(zoneId, timeAtRisk);

    // Accumulate or decay debt
    if (riskScore > 0.3) {
      // Debt accumulates proportionally to risk score
      currentDebt += this.debtAccumulationRate * riskScore;
    } else {
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
    let debtTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (history.length >= 5) {
      const recent = history.slice(-5);
      const first = recent[0];
      const last = recent[recent.length - 1];
      const change = last - first;
      if (change > 1) debtTrend = 'increasing';
      else if (change < -1) debtTrend = 'decreasing';
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

  getDebtHistory(zoneId: string): number[] {
    return this.debtHistory.get(zoneId) ?? [];
  }

  getTimeAtRisk(zoneId: string): number {
    return this.timeAtRisk.get(zoneId) ?? 0;
  }

  // Get debt metrics for all zones
  getAllDebtMetrics(zones: Zone[], riskScores: Map<string, number>): SafetyDebtMetrics[] {
    return zones.map(zone => {
      const history = this.debtHistory.get(zone.id) ?? [];
      const recent = history.slice(-5);
      const change = recent.length >= 2 ? recent.at(-1)! - recent[0] : 0;
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
  resetDebt(zoneId: string): void {
    this.debtHistory.set(zoneId, []);
    this.timeAtRisk.set(zoneId, 0);
  }

  // Get plant-wide debt summary
  getPlantDebtSummary(zones: Zone[]): { totalDebt: number; averageDebt: number; zonesAtRisk: number; criticalZones: string[] } {
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
