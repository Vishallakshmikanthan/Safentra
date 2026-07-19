import type { LedgerEntry } from '@safentra/types';
/** A deterministic, tamper-evident in-memory audit log. Persist entries in a real
 * append-only store in a multi-instance deployment. */
export declare class HashChain {
    private readonly entries;
    append(type: LedgerEntry['type'], payload: unknown): LedgerEntry;
    list(limit?: number): LedgerEntry[];
    verify(): {
        valid: boolean;
        entries: number;
        invalidIndex?: number;
    };
    private digest;
}
//# sourceMappingURL=HashChain.d.ts.map