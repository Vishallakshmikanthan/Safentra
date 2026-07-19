import type { OracleIntelligenceResponse, PlantState, WebSocketMessage } from '@safentra/types';
import { PlantGraph } from '../graph/PlantGraph';
import { HashChain } from '../ledger/HashChain';

export class OracleAgent {
  private queriedThisSession = false;

  constructor(private readonly graph: PlantGraph, private readonly ledger: HashChain) {}

  resetSession(): void {
    this.queriedThisSession = false;
  }

  autoQuery(broadcast: (message: WebSocketMessage) => void): OracleIntelligenceResponse | null {
    if (this.queriedThisSession) return null;
    this.queriedThisSession = true;
    return this.query('What is the most similar historical incident and what should operators do now?', true, broadcast);
  }

  query(question: string, autoQueried = false, broadcast?: (message: WebSocketMessage) => void): OracleIntelligenceResponse {
    const plantSnapshot = this.graph.getState();
    const elevated = Object.values(plantSnapshot.sensors).filter(sensor => sensor.status === 'elevated' || sensor.status === 'alarm');
    const criticalZones = Object.values(plantSnapshot.zones).filter(zone => zone.riskScore >= 0.6);

    const response: OracleIntelligenceResponse = {
      answer: [
        `Question: ${question.trim()}`,
        elevated.length
          ? `Live telemetry shows ${elevated.map(sensor => `${sensor.id} at ${sensor.currentValue}${sensor.unit}`).join(', ')}.`
          : 'Live telemetry is currently inside normal operating bands.',
        criticalZones.length
          ? `The most exposed zone is ${criticalZones.sort((a, b) => b.riskScore - a.riskScore)[0].id}. Treat this as a compound-risk event, not a single-sensor alarm.`
          : 'No confirmed critical zone is active, but permit and shift context should still be reviewed.',
        'The closest match is the Vizag Steel Plant Explosion pattern: sub-threshold gas elevation combined with handover complexity, hot work, and confined-space exposure.'
      ].join(' '),
      regulatoryCitation: 'OISD-GDN-169 Clause 4.3; OISD-STD-105 Clause 6.2; Factories Act 1948 Section 41G',
      historicalMatch: 'Vizag Steel Plant Explosion, January 2025',
      immediateRisk: criticalZones.length ? 'critical' : elevated.length ? 'elevated' : 'normal',
      recommendedActions: [
        'Suspend hot work in affected and adjacent zones.',
        'Revalidate all confined-space entries during shift handover.',
        'Run atmospheric testing before re-entry.',
        'Preserve sensor and permit records for incident review.'
      ],
      sources: ['Live PlantGraph snapshot', 'OISD-GDN-169', 'OISD-STD-105', 'Factories Act 1948'],
      confidence: elevated.length || criticalZones.length ? 0.9 : 0.72,
      autoQueried,
      plantSnapshot,
      timestamp: new Date().toISOString()
    };

    const entry = this.ledger.append('oracle_response', response);
    if (broadcast) {
      broadcast({ type: 'oracle_response', payload: response, timestamp: response.timestamp });
      broadcast({ type: 'oracle_update', payload: this.toPanelState(response), timestamp: response.timestamp });
      broadcast({ type: 'ledger_entry', payload: entry, timestamp: response.timestamp });
    }
    return response;
  }

  private toPanelState(response: OracleIntelligenceResponse) {
    const sensors = Object.values(response.plantSnapshot.sensors)
      .filter(sensor => sensor.status === 'elevated' || sensor.status === 'alarm')
      .map(sensor => sensor.id);

    return {
      isActive: true,
      recommendations: response.recommendedActions,
      regulations: [response.regulatoryCitation],
      historicalIncidents: [response.historicalMatch],
      explanation: response.answer,
      affectedSensors: sensors,
      affectedPermits: Object.values(response.plantSnapshot.permits).filter(permit => permit.status === 'active').map(permit => permit.id),
      workersAtRisk: Object.values(response.plantSnapshot.workers)
        .filter(worker => worker.status === 'in_confined_space' || response.plantSnapshot.zones[worker.currentZoneId]?.riskScore >= 0.6)
        .map(worker => worker.name),
      confidence: response.confidence,
      sources: response.sources,
      conversationHistory: [{ role: 'assistant' as const, text: response.answer }]
    };
  }
}
