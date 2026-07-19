import { Zone, SafetyDebtMetrics } from '@safentra/types';
export declare class SafetyDebt {
    private debtHistory;
    private maxHistoryLength;
    private debtAccumulationRate;
    private debtDecayRate;
    private timeAtRisk;
    updateDebt(zone: Zone, riskScore: number, tickIntervalMs?: number): SafetyDebtMetrics;
    getDebtHistory(zoneId: string): number[];
    getTimeAtRisk(zoneId: string): number;
    getAllDebtMetrics(zones: Zone[], riskScores: Map<string, number>): SafetyDebtMetrics[];
    resetDebt(zoneId: string): void;
    getPlantDebtSummary(zones: Zone[]): {
        totalDebt: number;
        averageDebt: number;
        zonesAtRisk: number;
        criticalZones: string[];
    };
}
//# sourceMappingURL=SafetyDebt.d.ts.map