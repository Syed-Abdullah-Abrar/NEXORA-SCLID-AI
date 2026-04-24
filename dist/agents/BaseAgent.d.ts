import { MemoryArtifact } from '../types';
import { VectorStore } from '../memory/VectorStore';
export declare abstract class BaseAgent {
    protected id: string;
    protected domain: string;
    protected vectorStore: VectorStore;
    constructor(id: string, domain: string);
    abstract ingest(input: unknown): Promise<MemoryArtifact>;
    protected createArtifact(data: unknown, tags: string[], priority?: 'low' | 'medium' | 'high' | 'critical'): Promise<MemoryArtifact>;
}
//# sourceMappingURL=BaseAgent.d.ts.map