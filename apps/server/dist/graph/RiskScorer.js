"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskScorer = void 0;
class RiskScorer {
    emaAlpha = 0.3; // EMA smoothing factor
    confirmationWindow = 3; // 3-tick confirmation window
    confirmationTicks = new Map();
    previousRawScores = new Map();
    calculateRiskScore(zone, patternResults) {
        // Calculate raw risk score from pattern contributions
        const matchedPatterns = patternResults.filter(p => p.matched && p.zoneId === zone.id);
        const rawScore = matchedPatterns.reduce((sum, p) => sum + p.riskContribution, 0);
        // Cap raw score at 1.0
        const cappedRawScore = Math.min(rawScore, 1.0);
        // Apply EMA smoothing
        const previousSmoothed = zone.riskScore;
        const smoothedScore = this.emaAlpha * cappedRawScore + (1 - this.emaAlpha) * previousSmoothed;
        // Confirmation window logic
        const zoneKey = zone.id;
        const prevRaw = this.previousRawScores.get(zoneKey) ?? 0;
        this.previousRawScores.set(zoneKey, cappedRawScore);
        let confirmationTick = this.confirmationTicks.get(zoneKey) ?? 0;
        // If raw score is elevated, increment confirmation counter
        if (cappedRawScore > 0.3) {
            confirmationTick = Math.min(confirmationTick + 1, this.confirmationWindow);
        }
        else {
            confirmationTick = 0;
        }
        this.confirmationTicks.set(zoneKey, confirmationTick);
        // Only apply high risk if confirmed for 3 ticks
        let finalScore = smoothedScore;
        if (confirmationTick < this.confirmationWindow && cappedRawScore > 0.5) {
            // Dampen score during confirmation window
            finalScore = smoothedScore * (confirmationTick / this.confirmationWindow);
        }
        // Determine severity
        let severity = 'low';
        if (finalScore >= 0.8)
            severity = 'critical';
        else if (finalScore >= 0.6)
            severity = 'high';
        else if (finalScore >= 0.3)
            severity = 'medium';
        return {
            riskScore: Math.round(finalScore * 100) / 100,
            rawRiskScore: Math.round(cappedRawScore * 100) / 100,
            severity
        };
    }
    createRiskEvent(zone, patternResults) {
        const matchedPatterns = patternResults.filter(p => p.matched && p.zoneId === zone.id);
        if (matchedPatterns.length === 0)
            return null;
        const primaryPattern = matchedPatterns.reduce((max, p) => p.confidence > max.confidence ? p : p, matchedPatterns[0]);
        const allFactors = matchedPatterns.flatMap(p => p.contributingFactors);
        const totalRiskContribution = matchedPatterns.reduce((sum, p) => sum + p.riskContribution, 0);
        const severity = this.getSeverityFromScore(totalRiskContribution);
        return {
            id: `RE-${Date.now()}-${zone.id}`,
            timestamp: new Date().toISOString(),
            zoneId: zone.id,
            riskScore: totalRiskContribution,
            patternMatched: primaryPattern.patternId,
            patternDescription: primaryPattern.patternName,
            contributingFactors: allFactors,
            recommendedAction: this.getRecommendedAction(primaryPattern.patternId, zone),
            severity
        };
    }
    getSeverityFromScore(score) {
        if (score >= 0.8)
            return 'critical';
        if (score >= 0.6)
            return 'high';
        if (score >= 0.3)
            return 'medium';
        return 'low';
    }
    getRecommendedAction(patternId, zone) {
        const actions = {
            'P1': 'Suspend hot work immediately. Ventilate zone. Verify gas levels before resuming.',
            'P2': 'Evacuate confined space. Deploy gas monitoring. No entry until levels normalize.',
            'P3': 'Mandatory permit re-verification during shift handover. Brief incoming shift on active permits.',
            'P4': 'Trace gas source. Check adjacent zone ventilation. Prepare evacuation routes.',
            'P5': 'Immediate rescue standby. Continuous gas monitoring. Establish communication with isolated workers.',
            'P6': 'Check process parameters. Verify cooling systems. Prepare emergency depressurization.',
            'P7': 'STOP WORK. Conflicting permits cannot coexist. Resolve before any activity resumes.',
            'P8': 'Calibrate or replace suspect sensors. Cross-reference with redundant sensors.',
            'P9': 'Stop conveyor. Clear personnel. Verify lockout/tagout before restart.',
            'P10': 'EVACUATE IMMEDIATELY. Oxygen deficiency is immediately dangerous to life and health (IDLH).',
            'P11': 'Initiate safety stand-down. Review all active permits. Address accumulated debt items.',
            'P12': 'CRITICAL: Vizag pattern matched. Full emergency protocol. Evacuate zone. Notify DGMS.',
            'P13': 'Investigate root cause of risk acceleration. Check for cascading failures.'
        };
        return actions[patternId] || 'Investigate and mitigate identified risk factors.';
    }
    // Get confirmation status for a zone
    getConfirmationStatus(zoneId) {
        const ticks = this.confirmationTicks.get(zoneId) ?? 0;
        return {
            ticks,
            required: this.confirmationWindow,
            confirmed: ticks >= this.confirmationWindow
        };
    }
    // Reset confirmation for a zone (e.g., after risk clears)
    resetConfirmation(zoneId) {
        this.confirmationTicks.set(zoneId, 0);
    }
}
exports.RiskScorer = RiskScorer;
//# sourceMappingURL=RiskScorer.js.map