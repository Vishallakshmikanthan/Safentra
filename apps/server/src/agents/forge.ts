import { randomUUID } from 'node:crypto';
import type { ForgeCandidate, ForgeSubmission, WebSocketMessage } from '@safentra/types';
import { HashChain } from '../ledger/HashChain';
import { completeWithNemotron, isNemotronConfigured } from './nemotronClient';

type CandidateStatus = 'pending' | 'approved' | 'rejected';

export interface ForgeCandidateRecord extends ForgeCandidate {
  id: string;
  status: CandidateStatus;
  regulatoryRef: string;
  riskScore: number;
  isGenuinelyNovel: boolean;
  matchesExistingPattern: string | null;
  createdAt: string;
}

interface LlmExtraction {
  conditions: string[];
  matchesExistingPattern: string | null;
  suggestedRegulatoryRef: string;
  suggestedRiskScore: number;
  rationale: string;
}

const EXISTING_PATTERNS = [
  'P01 Hot Work Near Gas Elevation', 'P02 Confined Entry + Abnormal Process',
  'P03 Maintenance + Gas Holder Pressure', 'P04 Shift Changeover + Active Permits',
  'P05 Multi-Worker Confined Space', 'P06 Gas Pressure Creep + Permit',
  'P07 Oxygen Depletion + Hot Work', 'P08 H2S Elevation + Confined Entry',
  'P09 CO Accumulation + Maintenance', 'P10 Temperature Spike + Gas Pressure',
  'P11 Flow Rate Anomaly + Permit', 'P12 Vizag Compound Pattern'
];

export class ForgeAgent {
  private readonly candidates = new Map<string, ForgeCandidateRecord>();

  constructor(private readonly ledger: HashChain) {}

  async submit(
    payload: { description: string; zoneId: string; severity: ForgeSubmission['severity']; tags: string[] },
    broadcast?: (message: WebSocketMessage) => void
  ): Promise<ForgeCandidateRecord> {
    const description = payload.description.trim();
    const extraction = await this.extractConditions(description);

    const candidateId = `FORGE-${Date.now()}`;
    const candidate: ForgeCandidateRecord = {
      id: candidateId,
      status: 'pending',
      regulatoryRef: extraction.suggestedRegulatoryRef,
      riskScore: extraction.suggestedRiskScore,
      isGenuinelyNovel: !extraction.matchesExistingPattern,
      matchesExistingPattern: extraction.matchesExistingPattern,
      createdAt: new Date().toISOString(),
      confidence: Math.min(0.95, 0.5 + extraction.conditions.length * 0.08),
      suggestedPatternId: extraction.matchesExistingPattern ?? 'P13',
      matchedReports: [{
        reportId: randomUUID(),
        reporterId: 'safety-officer',
        timestamp: new Date().toISOString(),
        zoneId: payload.zoneId,
        description,
        severity: payload.severity,
        tags: payload.tags
      }],
      pattern: {
        id: candidateId,
        name: extraction.matchesExistingPattern ? 'Matched Compound Risk Pattern' : 'Operator-Reported Emerging Hazard',
        description: extraction.rationale || description,
        conditions: extraction.conditions.length ? extraction.conditions : ['Operator submitted near-miss requires review'],
        frequency: 1,
        lastSeen: new Date().toISOString(),
        status: 'candidate',
        sourceReports: []
      }
    };

    this.candidates.set(candidate.id, candidate);
    const entry = this.ledger.append('forge_candidate', candidate);
    if (broadcast) {
      broadcast({ type: 'forge_candidate', payload: { candidates: [candidate], approvalHistory: [], rejectionHistory: [] }, timestamp: candidate.createdAt });
      broadcast({ type: 'ledger_entry', payload: entry, timestamp: candidate.createdAt });
    }
    return candidate;
  }

  /** Real Nemotron-based extraction when configured; deterministic keyword-matching
   * fallback otherwise. Never throws — always returns a usable extraction. */
  private async extractConditions(description: string): Promise<LlmExtraction> {
    if (isNemotronConfigured()) {
      const raw = await completeWithNemotron({
        system: `You are FORGE, the pattern-discovery agent for Safentra, an industrial safety platform. A safety officer submits free-text near-miss reports; your job is to extract the distinct hazardous CONDITIONS present (not a summary — a list of concrete, checkable conditions like "hot work permit active" or "worker in confined space without standby"). Compare against Safentra's existing pattern library below and decide if this report matches one of them or represents a genuinely new compound-risk combination.

Existing patterns: ${EXISTING_PATTERNS.join('; ')}

Respond with ONLY valid JSON, no other text, no markdown fences, matching exactly this shape:
{
  "conditions": ["condition 1", "condition 2"],
  "matchesExistingPattern": "P01"-style id or null if genuinely novel,
  "suggestedRegulatoryRef": "best-guess OISD/DGMS/Factories Act clause, or a general safety principle if unsure",
  "suggestedRiskScore": number between 0 and 1,
  "rationale": "1-2 sentence explanation of why this combination is dangerous"
}`,
        user: `Near-miss report:\n"""${description}"""`,
        maxTokens: 400,
        temperature: 0.2
      });

      if (raw) {
        try {
          const cleaned = raw.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleaned) as Partial<LlmExtraction>;
          if (Array.isArray(parsed.conditions)) {
            return {
              conditions: parsed.conditions.map(String).slice(0, 8),
              matchesExistingPattern: typeof parsed.matchesExistingPattern === 'string' ? parsed.matchesExistingPattern : null,
              suggestedRegulatoryRef: parsed.suggestedRegulatoryRef ?? 'OISD-GDN-169 / OISD-STD-105',
              suggestedRiskScore: typeof parsed.suggestedRiskScore === 'number' ? Math.min(0.96, Math.max(0, parsed.suggestedRiskScore)) : 0.6,
              rationale: parsed.rationale ?? ''
            };
          }
        } catch (err) {
          console.error('FORGE: failed to parse Nemotron response as JSON, falling back to keyword extraction', err);
        }
      }
    }

    return this.keywordFallback(description);
  }

  private keywordFallback(description: string): LlmExtraction {
    const lower = description.toLowerCase();
    const conditions = [
      lower.includes('gas') ? 'Gas reading elevated but below alarm threshold' : null,
      lower.includes('hot') || lower.includes('weld') ? 'Concurrent hot work or ignition source' : null,
      lower.includes('confined') || lower.includes('entry') ? 'Confined-space exposure reported' : null,
      lower.includes('shift') || lower.includes('handover') ? 'Shift handover or communication gap' : null,
      lower.includes('oxygen') || lower.includes('o2') ? 'Oxygen depletion suspected' : null
    ].filter((value): value is string => Boolean(value));

    const matchesExistingPattern = conditions.length >= 3 ? 'P12' : conditions.some(c => c.includes('Oxygen')) ? 'P07' : null;
    return {
      conditions,
      matchesExistingPattern,
      suggestedRegulatoryRef: 'OISD-GDN-169 / OISD-STD-105',
      suggestedRiskScore: Math.min(0.96, 0.45 + conditions.length * 0.11),
      rationale: 'Extracted via keyword heuristics — set NEMOTRON_API_KEY for full LLM-based extraction.'
    };
  }

  list(): ForgeCandidateRecord[] {
    return Array.from(this.candidates.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  approve(id: string): ForgeCandidateRecord | null {
    return this.setStatus(id, 'approved');
  }

  reject(id: string): ForgeCandidateRecord | null {
    return this.setStatus(id, 'rejected');
  }

  private setStatus(id: string, status: CandidateStatus): ForgeCandidateRecord | null {
    const candidate = this.candidates.get(id);
    if (!candidate) return null;
    candidate.status = status;
    candidate.pattern.status = status === 'approved' ? 'validated' : 'rejected';
    this.ledger.append('forge_action', { id, status });
    return candidate;
  }
}
