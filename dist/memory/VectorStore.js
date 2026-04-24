"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStore = void 0;
class VectorStore {
    constructor() {
        this.vectors = [];
    }
    async embed(text) {
        const hash = this.simpleHash(text);
        return Array.from({ length: 128 }, (_, i) => {
            return ((hash * (i + 1)) % 1000) / 1000 - 0.5;
        });
    }
    async insert(id, vector) {
        this.vectors.push({ id, vector });
    }
    async search(query, limit) {
        return this.vectors
            .map(entry => ({
            id: entry.id,
            similarity: this.cosineSimilarity(query, entry.vector),
        }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);
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
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}
exports.VectorStore = VectorStore;
//# sourceMappingURL=VectorStore.js.map