import { MemoryArtifact } from '../types';
import { VectorStore } from '../memory/VectorStore';

export abstract class BaseAgent {
  protected id: string;
  protected domain: string;
  protected vectorStore: VectorStore;

  constructor(id: string, domain: string) {
    this.id = id;
    this.domain = domain;
    this.vectorStore = new VectorStore();
  }

  abstract ingest(input: unknown): Promise<MemoryArtifact>;

  protected async createArtifact(
    data: unknown,
    tags: string[],
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<MemoryArtifact> {
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