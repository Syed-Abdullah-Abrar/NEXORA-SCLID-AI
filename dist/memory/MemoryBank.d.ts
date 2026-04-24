import { MemoryArtifact } from '../types';
export type Tier = 'current' | 'short' | 'long';
export declare class MemoryBank {
    private current;
    private shortTerm;
    private longTerm;
    store(artifact: MemoryArtifact, tier: Tier): Promise<void>;
    get(id: string): Promise<MemoryArtifact | null>;
    promote(id: string, fromTier: Tier, toTier: Tier): Promise<void>;
    query(vector: number[], limit: number): Promise<MemoryArtifact[]>;
    private cosineSimilarity;
    private getTierMap;
}
//# sourceMappingURL=MemoryBank.d.ts.map