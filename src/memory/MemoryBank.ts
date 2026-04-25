import { MemoryArtifact } from '../types';

export type Tier = 'current' | 'short' | 'long';

export class MemoryBank {
  private current: Map<string, MemoryArtifact> = new Map();
  private shortTerm: Map<string, MemoryArtifact> = new Map();
  private longTerm: Map<string, MemoryArtifact> = new Map();

  async store(artifact: MemoryArtifact, tier: Tier): Promise<void> {
    const frozen = Object.freeze({ ...artifact });
    switch (tier) {
      case 'current':
        this.current.set(artifact.id, frozen as MemoryArtifact);
        break;
      case 'short':
        this.shortTerm.set(artifact.id, frozen as MemoryArtifact);
        break;
      case 'long':
        this.longTerm.set(artifact.id, frozen as MemoryArtifact);
        break;
    }
  }

  async get(id: string): Promise<MemoryArtifact | null> {
    return (
      this.current.get(id) ||
      this.shortTerm.get(id) ||
      this.longTerm.get(id) ||
      null
    );
  }

  async promote(id: string, fromTier: Tier, toTier: Tier): Promise<void> {
    const artifact = await this.get(id);
    if (!artifact) return;

    const tierMap = this.getTierMap(fromTier);
    tierMap.delete(id);

    await this.store(artifact, toTier);
  }

  async query(vector: number[], limit: number): Promise<MemoryArtifact[]> {
    const allArtifacts = [
      ...Array.from(this.longTerm.values()),
      ...Array.from(this.shortTerm.values()),
      ...Array.from(this.current.values()),
    ];

    return allArtifacts
      .filter(a => a.vector)
      .map(a => ({
        artifact: a,
        similarity: this.cosineSimilarity(vector, a.vector!),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(r => r.artifact);
  }

  getAll(): MemoryArtifact[] {
    return [
      ...Array.from(this.current.values()),
      ...Array.from(this.shortTerm.values()),
      ...Array.from(this.longTerm.values()),
    ];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-10);
  }

  private getTierMap(tier: Tier): Map<string, MemoryArtifact> {
    switch (tier) {
      case 'current': return this.current;
      case 'short': return this.shortTerm;
      case 'long': return this.longTerm;
    }
  }
}