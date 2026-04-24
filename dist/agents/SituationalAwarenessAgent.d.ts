import { MemoryArtifact } from '../types';
import { BaseAgent } from './BaseAgent';
interface GeoData {
    lat: number;
    lon: number;
    population?: number;
    criticalInfrastructure?: string[];
    shelterLocations?: string[];
}
export declare class SituationalAwarenessAgent extends BaseAgent {
    constructor();
    ingest(input: unknown): Promise<MemoryArtifact>;
    fuse(earlyWarning: MemoryArtifact, geodata: GeoData): Promise<MemoryArtifact>;
    fuseMultiple(earlyWarnings: MemoryArtifact[], geodata: GeoData): Promise<MemoryArtifact>;
    private calculateRiskLevel;
    private calculateAffectedPopulation;
    private combineSeverities;
    private generateActions;
    private buildUnifiedPicture;
}
export {};
//# sourceMappingURL=SituationalAwarenessAgent.d.ts.map