import { MemoryArtifact } from '../types';
import { BaseAgent } from './BaseAgent';
interface RoutePoint {
    name: string;
    lat: number;
    lon: number;
}
interface Route {
    from: string;
    to: string;
    distance: number;
    waypoints: string[];
}
export declare class ResourceAllocationAgent extends BaseAgent {
    constructor();
    ingest(input: unknown): Promise<MemoryArtifact>;
    allocate(situational: MemoryArtifact): Promise<MemoryArtifact>;
    private calculatePersonnel;
    private generateSupplyList;
    private generateActions;
    private generatePlanName;
    private estimateDuration;
    optimizeRoutes(locations: RoutePoint[]): Promise<Route[]>;
    private haversineDistance;
    private toRad;
    private generateWaypoints;
    formatForHAM(plan: MemoryArtifact): string;
}
export {};
//# sourceMappingURL=ResourceAllocationAgent.d.ts.map