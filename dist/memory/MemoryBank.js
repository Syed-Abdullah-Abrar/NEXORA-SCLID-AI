"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryBank = void 0;
class MemoryBank {
    constructor() {
        this.current = new Map();
        this.shortTerm = new Map();
        this.longTerm = new Map();
    }
    async store(artifact, tier) {
        const frozen = Object.freeze({ ...artifact });
        switch (tier) {
            case 'current':
                this.current.set(artifact.id, frozen);
                break;
            case 'short':
                this.shortTerm.set(artifact.id, frozen);
                break;
            case 'long':
                this.longTerm.set(artifact.id, frozen);
                break;
        }
    }
    async get(id) {
        return (this.current.get(id) ||
            this.shortTerm.get(id) ||
            this.longTerm.get(id) ||
            null);
    }
    async promote(id, fromTier, toTier) {
        const artifact = await this.get(id);
        if (!artifact)
            return;
        const tierMap = this.getTierMap(fromTier);
        tierMap.delete(id);
        await this.store(artifact, toTier);
    }
    async query(vector, limit) {
        const allArtifacts = [
            ...Array.from(this.longTerm.values()),
            ...Array.from(this.shortTerm.values()),
            ...Array.from(this.current.values()),
        ];
        return allArtifacts
            .filter(a => a.vector)
            .map(a => ({
            artifact: a,
            similarity: this.cosineSimilarity(vector, a.vector),
        }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(r => r.artifact);
    }
    cosineSimilarity(a, b) {
        let dot = 0, magA = 0, magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-10);
    }
    getTierMap(tier) {
        switch (tier) {
            case 'current': return this.current;
            case 'short': return this.shortTerm;
            case 'long': return this.longTerm;
        }
    }
}
exports.MemoryBank = MemoryBank;
//# sourceMappingURL=MemoryBank.js.map