import { MemoryArtifact } from '../types';
import { BaseAgent } from './BaseAgent';
export declare class EarlyWarningAgent extends BaseAgent {
    constructor();
    ingest(input: unknown): Promise<MemoryArtifact>;
    private detectHazard;
    private isFloodRisk;
    private isWildfireRisk;
    private isSevereWeather;
    private isHeatWave;
    private calculateSeverity;
    private riskScore;
    private calculateConfidence;
    private estimateAffectedArea;
}
//# sourceMappingURL=EarlyWarningAgent.d.ts.map