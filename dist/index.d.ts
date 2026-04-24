import { MemoryArtifact, AgentSkill, AgentDomain } from './types';
import { TaskPlanner } from './orchestrator/TaskPlanner';
import { AgentRegistry } from './orchestrator/AgentRegistry';
import { MemoryBank } from './memory/MemoryBank';
import { EarlyWarningAgent } from './agents/EarlyWarningAgent';
import { SituationalAwarenessAgent } from './agents/SituationalAwarenessAgent';
import { ResourceAllocationAgent } from './agents/ResourceAllocationAgent';
import { HAMBridgeService } from './ham/HAMBridgeService';
import { VoiceSynthesizer } from './ham/VoiceSynthesizer';
import { PacketRadioHandler } from './ham/PacketRadioHandler';
export declare class NexoraPipeline {
    private planner;
    private registry;
    private memoryBank;
    private earlyWarning;
    private situational;
    private resource;
    private hamBridge;
    private voiceSynth;
    private packetRadio;
    constructor();
    private registerAgents;
    runFullPipeline(query: string, weatherData?: unknown, geodata?: unknown): Promise<{
        taskGraph: {
            tasks: Array<{
                id: string;
                agentId: string;
                dependencies: string[];
            }>;
        };
        artifacts: MemoryArtifact[];
        finalPlan: MemoryArtifact | null;
    }>;
    processHAMInput(aprsData: string): Promise<MemoryArtifact>;
    broadcastViaHAM(plan: MemoryArtifact, mode?: 'voice' | 'packet'): Promise<string>;
    getMemoryBank(): MemoryBank;
    getAgentRegistry(): AgentRegistry;
}
export { MemoryArtifact, AgentSkill, AgentDomain };
export { TaskPlanner, AgentRegistry, MemoryBank };
export { EarlyWarningAgent, SituationalAwarenessAgent, ResourceAllocationAgent };
export { HAMBridgeService, VoiceSynthesizer, PacketRadioHandler };
//# sourceMappingURL=index.d.ts.map