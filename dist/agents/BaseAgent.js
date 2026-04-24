"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const VectorStore_1 = require("../memory/VectorStore");
class BaseAgent {
    constructor(id, domain) {
        this.id = id;
        this.domain = domain;
        this.vectorStore = new VectorStore_1.VectorStore();
    }
    async createArtifact(data, tags, priority = 'medium') {
        const textForEmbedding = JSON.stringify(data);
        const vector = await this.vectorStore.embed(textForEmbedding);
        return {
            id: `${this.id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source: this.domain,
            data,
            tags,
            vector,
        };
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=BaseAgent.js.map