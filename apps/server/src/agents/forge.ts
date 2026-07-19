import { randomUUID } from 'node:crypto';
import type { ForgeCandidate, ForgeSubmission, WebSocketMessage } from '@safentra/types';
import { HashChain } from '../ledger/HashChain';

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

export class ForgeAgent {
  private readonly candidates = new Map<string, ForgeCandidateRecord>();

  constructor(private readonly ledger: HashChain) {}

  submit(
    payload: { description: string; zoneId: string; severity: ForgeSubmission['severity']; tags: string[] },
    broadcast?: (message: WebSocketMessage) => void
  ): ForgeCandidateRecord {
    const description = payload.description.trim();
    const lower = description.toLowerCase();
    const conditions = [
      lower.includes('gas') ? 'Gas reading elevated but below alarm threshold' : null,
      lower.includes('hot') || lower.includes('weld') ? 'Concurrent hot work or ignition source' : null,
      lower.includes('confined') || lower.includes('entry') ? 'Confined-space exposure reported' : null,
      lower.includes('shift') || lower.includes('handover') ? 'Shift handover or communication gap' : null,
      lower.includes('oxygen') || lower.includes('o2') ? 'Oxygen depletion suspected' : null
    ].filter((value): value is string => Boolean(value));

    const matchesExistingPattern = conditions.length >= 3 ? 'P12' : conditions.some(c => c.includes('Oxygen')) ? 'P10' : null;
    const candidateId = `FORGE-${Date.now()}`;
    const candidate: ForgeCandidateRecord = {
      id: candidateId,
      status: 'pending',
      regulatoryRef: 'OISD-GDN-169 / OISD-STD-105',
      riskScore: Math.min(0.96, 0.45 + conditions.length * 0.11),
      isGenuinelyNovel: !matchesExistingPattern,
      matchesExistingPattern,
      createdAt: new Date().toISOString(),
      confidence: Math.min(0.95, 0.55 + conditions.length * 0.08),
      suggestedPatternId: matchesExistingPattern ?? 'P13',
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
        name: matchesExistingPattern ? 'Matched Compound Risk Pattern' : 'Operator-Reported Emerging Hazard',
        description,
        conditions: conditions.length ? conditions : ['Operator submitted near-miss requires review'],
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
