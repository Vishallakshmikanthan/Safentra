import { createHash } from 'node:crypto';
import type { LedgerEntry } from '@safentra/types';

/** A deterministic, tamper-evident in-memory audit log. Persist entries in a real
 * append-only store in a multi-instance deployment. */
export class HashChain {
  private readonly entries: LedgerEntry[] = [];

  append(type: LedgerEntry['type'], payload: unknown): LedgerEntry {
    const previousHash = this.entries.at(-1)?.hash ?? 'GENESIS';
    const entry: LedgerEntry = {
      index: this.entries.length,
      timestamp: new Date().toISOString(),
      type,
      payload,
      previousHash,
      hash: ''
    };
    entry.hash = this.digest(entry);
    this.entries.push(entry);
    return entry;
  }

  list(limit = 100): LedgerEntry[] {
    return this.entries.slice(Math.max(0, this.entries.length - limit));
  }

  verify(): { valid: boolean; entries: number; invalidIndex?: number } {
    for (let index = 0; index < this.entries.length; index += 1) {
      const entry = this.entries[index];
      const expectedPrevious = index === 0 ? 'GENESIS' : this.entries[index - 1].hash;
      if (entry.previousHash !== expectedPrevious || entry.hash !== this.digest(entry)) {
        return { valid: false, entries: this.entries.length, invalidIndex: index };
      }
    }
    return { valid: true, entries: this.entries.length };
  }

  private digest(entry: LedgerEntry): string {
    const canonical = JSON.stringify({
      index: entry.index,
      timestamp: entry.timestamp,
      type: entry.type,
      payload: entry.payload,
      previousHash: entry.previousHash
    });
    return createHash('sha256').update(canonical).digest('hex');
  }
}
