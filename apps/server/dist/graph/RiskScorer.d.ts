import { Zone, PatternResult, RiskEvent, RiskSeverity } from '@safentra/types';
export declare class RiskScorer {
    private emaAlpha;
    private confirmationWindow;
    private confirmationTicks;
    private previousRawScores;
    calculateRiskScore(zone: Zone, patternResults: PatternResult[]): {
        riskScore: number;
        rawRiskScore: number;
        severity: RiskSeverity;
    };
    createRiskEvent(zone: Zone, patternResults: PatternResult[]): RiskEvent | null;
    private getSeverityFromScore;
    private getRecommendedAction;
    getConfirmationStatus(zoneId: string): {
        ticks: number;
        required: number;
        confirmed: boolean;
    };
    resetConfirmation(zoneId: string): void;
}
//# sourceMappingURL=RiskScorer.d.ts.map