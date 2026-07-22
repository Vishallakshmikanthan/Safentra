import type { OracleIntelligenceResponse, PlantState, WebSocketMessage } from '@safentra/types';
import { PlantGraph } from '../graph/PlantGraph';
import { HashChain } from '../ledger/HashChain';
import { completeWithNemotron, isNemotronConfigured } from './nemotronClient';

// A small, embedded regulatory/incident corpus. ORACLE grounds every answer in this
// context via the system prompt (a lightweight RAG pattern — no vector DB needed at
// this corpus size). Expand this as you add more regulations or incident write-ups.
const CORPUS = `
[Vizag Steel Plant Explosion, January 2025] 8 fatalities. Gas pressure crept up but stayed
below the single-sensor alarm threshold, while three workers entered a confined space during
a shift changeover, with a hot-work permit being prepared in the adjacent zone. No single
sensor breached its limit — the danger was the combination.

[OISD-GDN-169 Clause 4.2] Atmospheric testing required before confined-space entry: O2 min
19.5%, flammable gas max 10% LEL, H2S max 5 ppm STEL, CO max 25 ppm.
[OISD-GDN-169 Clause 4.3] Confined-space entry is prohibited if atmospheric testing is outside
safe range OR if any hot work is active within 50m of the entry point.
[OISD-GDN-169 Clause 4.7] Maximum one confined-space operation per zone cluster at a time.
[OISD-GDN-169 Clause 6.1] On gas pressure elevation, suspend all permits within 100m pending
investigation.
[OISD-GDN-169 Clause 7.3] All confined-space operations must complete before shift handover;
incoming shift must receive atmospheric test results before authorising new entries.

[OISD-STD-105 Clause 6.2] Hot work permits prohibited where flammable/toxic gas exceeds 10%
LEL or 25% STEL; atmospheric conditions must be verified with a calibrated detector within 30
minutes of work start.
[OISD-STD-105 Clause 7.4] Hot work and confined-space entry must not run simultaneously within
50m of each other.

[Factories Act 1948, Section 41B] Occupiers of hazardous-process factories must disclose all
hazard information — current gas readings, active permits, environmental conditions — at shift
commencement, and continuously as new information arises.
[Factories Act 1948, Section 41G] Outgoing shift-in-charge must confirm in writing that all
confined spaces are cleared and atmospheric readings are safe before the incoming shift
countersigns the handover.

[DGMS Circular 2022/11] Requires compound-condition monitoring for coke oven and gas-holder
areas following documented incidents where individually-normal readings combined into unsafe
conditions.
`.trim();

export class OracleAgent {
  private queriedThisSession = false;

  constructor(private readonly graph: PlantGraph, private readonly ledger: HashChain) {}

  resetSession(): void {
    this.queriedThisSession = false;
  }

  autoQuery(broadcast: (message: WebSocketMessage) => void): Promise<OracleIntelligenceResponse | null> {
    if (this.queriedThisSession) return Promise.resolve(null);
    this.queriedThisSession = true;
    return this.query('What is the most similar historical incident and what should operators do now?', true, broadcast);
  }

  async query(
    question: string,
    autoQueried = false,
    broadcast?: (message: WebSocketMessage) => void
  ): Promise<OracleIntelligenceResponse> {
    const plantSnapshot = this.graph.getState();
    const elevated = Object.values(plantSnapshot.sensors).filter(sensor => sensor.status === 'elevated' || sensor.status === 'alarm');
    const criticalZones = Object.values(plantSnapshot.zones).filter(zone => zone.riskScore >= 0.6);

    const answer = await this.generateAnswer(question, plantSnapshot, elevated, criticalZones);

    const response: OracleIntelligenceResponse = {
      answer,
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

  /** Real Nemotron-generated answer when NEMOTRON_API_KEY is set, deterministic
   * template fallback otherwise — never throws, always returns a usable string. */
  private async generateAnswer(
    question: string,
    plantSnapshot: PlantState,
    elevated: PlantState['sensors'][string][],
    criticalZones: PlantState['zones'][string][]
  ): Promise<string> {
    if (isNemotronConfigured()) {
      const telemetrySummary = elevated.length
        ? elevated.map(s => `${s.id} (zone ${s.zoneId}): ${s.currentValue}${s.unit}, status=${s.status}`).join('; ')
        : 'All sensors currently within normal operating bands.';
      const zoneSummary = criticalZones.length
        ? criticalZones.map(z => `${z.id} (${z.name}): risk ${(z.riskScore * 100).toFixed(0)}%`).join('; ')
        : 'No zone currently at or above 60% compound risk.';

      const llmAnswer = await completeWithNemotron({
        system: `You are ORACLE, the regulatory intelligence agent for Safentra, an industrial safety platform for a coke oven battery plant. Answer the safety officer's question using ONLY the regulatory/incident corpus and live plant telemetry provided below. Cite specific clause numbers (e.g. "OISD-GDN-169 Clause 4.3") inline. Be concise, operational, and direct — this is read under time pressure during a shift. Do not invent regulations not present in the corpus.

<corpus>
${CORPUS}
</corpus>`,
        user: `Live telemetry: ${telemetrySummary}
Zone risk status: ${zoneSummary}

Safety officer's question: ${question.trim()}`,
        maxTokens: 500,
        temperature: 0.2
      });
      if (llmAnswer) return llmAnswer;
      // fall through to template if the API call failed for any reason
    }

    return [
      `Question: ${question.trim()}`,
      elevated.length
        ? `Live telemetry shows ${elevated.map(sensor => `${sensor.id} at ${sensor.currentValue}${sensor.unit}`).join(', ')}.`
        : 'Live telemetry is currently inside normal operating bands.',
      criticalZones.length
        ? `The most exposed zone is ${criticalZones.sort((a, b) => b.riskScore - a.riskScore)[0].id}. Treat this as a compound-risk event, not a single-sensor alarm.`
        : 'No confirmed critical zone is active, but permit and shift context should still be reviewed.',
      'The closest match is the Vizag Steel Plant Explosion pattern: sub-threshold gas elevation combined with handover complexity, hot work, and confined-space exposure.'
    ].join(' ');
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
