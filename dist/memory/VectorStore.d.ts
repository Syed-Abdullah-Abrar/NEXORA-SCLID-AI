export declare class VectorStore {
    private vectors;
    embed(text: string): Promise<number[]>;
    insert(id: string, vector: number[]): Promise<void>;
    search(query: number[], limit: number): Promise<{
        id: string;
        similarity: number;
    }[]>;
    private cosineSimilarity;
    private simpleHash;
}
//# sourceMappingURL=VectorStore.d.ts.map