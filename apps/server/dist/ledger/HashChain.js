"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashChain = void 0;
const node_crypto_1 = require("node:crypto");
/** A deterministic, tamper-evident in-memory audit log. Persist entries in a real
 * append-only store in a multi-instance deployment. */
class HashChain {
    entries = [];
    append(type, payload) {
        const previousHash = this.entries.at(-1)?.hash ?? 'GENESIS';
        const entry = {
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
    list(limit = 100) {
        return this.entries.slice(Math.max(0, this.entries.length - limit));
    }
    verify() {
        for (let index = 0; index < this.entries.length; index += 1) {
            const entry = this.entries[index];
            const expectedPrevious = index === 0 ? 'GENESIS' : this.entries[index - 1].hash;
            if (entry.previousHash !== expectedPrevious || entry.hash !== this.digest(entry)) {
                return { valid: false, entries: this.entries.length, invalidIndex: index };
            }
        }
        return { valid: true, entries: this.entries.length };
    }
    digest(entry) {
        const canonical = JSON.stringify({
            index: entry.index,
            timestamp: entry.timestamp,
            type: entry.type,
            payload: entry.payload,
            previousHash: entry.previousHash
        });
        return (0, node_crypto_1.createHash)('sha256').update(canonical).digest('hex');
    }
}
exports.HashChain = HashChain;
//# sourceMappingURL=HashChain.js.map