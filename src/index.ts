import { MemoryArtifact, AgentSkill, AgentDomain, GeoData } from './types';
import { APRSParsingError } from './types/errors';
import { TaskPlanner } from './orchestrator/TaskPlanner';
import { AgentRegistry } from './orchestrator/AgentRegistry';
import { MemoryBank } from './memory/MemoryBank';
import { EarlyWarningAgent } from './agents/EarlyWarningAgent';
import { SituationalAwarenessAgent } from './agents/SituationalAwarenessAgent';
import { ResourceAllocationAgent } from './agents/ResourceAllocationAgent';
import { HAMBridgeService } from './ham/HAMBridgeService';
import { VoiceSynthesizer } from './ham/VoiceSynthesizer';
import { PacketRadioHandler } from './ham/PacketRadioHandler';

export class NexoraPipeline {
  private planner: TaskPlanner;
  private registry: AgentRegistry;
  private memoryBank: MemoryBank;
  private earlyWarning: EarlyWarningAgent;
  private situational: SituationalAwarenessAgent;
  private resource: ResourceAllocationAgent;
  private hamBridge: HAMBridgeService;
  private voiceSynth: VoiceSynthesizer;
  private packetRadio: PacketRadioHandler;

  constructor() {
    this.planner = new TaskPlanner();
    this.registry = new AgentRegistry();
    this.memoryBank = new MemoryBank();
    this.earlyWarning = new EarlyWarningAgent();
    this.situational = new SituationalAwarenessAgent();
    this.resource = new ResourceAllocationAgent();
    this.hamBridge = new HAMBridgeService();
    this.voiceSynth = new VoiceSynthesizer();
    this.packetRadio = new PacketRadioHandler();

    this.registerAgents();
  }

  private registerAgents(): void {
    const agents: AgentSkill[] = [
      { id: 'early_warning', domain: 'early_warning', description: 'Weather hazard prediction', inputSchema: {}, outputSchema: {} },
      { id: 'situational_awareness', domain: 'situational_awareness', description: 'Multi-modal fusion', inputSchema: {}, outputSchema: {} },
      { id: 'resource_allocation', domain: 'resource_allocation', description: 'Resource planning', inputSchema: {}, outputSchema: {} },
    ];

    agents.forEach(agent => this.registry.register(agent));
  }

  async runFullPipeline(query: string, weatherData?: unknown, geodata?: unknown): Promise<{
    taskGraph: { tasks: Array<{ id: string; agentId: string; dependencies: string[] }> };
    artifacts: MemoryArtifact[];
    finalPlan: MemoryArtifact | null;
  }> {
    // Step 1: Task Planning (SC-1)
    const plan = await this.planner.generatePlan(query);

    // Step 2: Early Warning
    const ewInput = weatherData || { stationId: 'AUTO-001', rainfall: 5, riverLevel: 18 };
    const ewArtifact = await this.earlyWarning.ingest(ewInput);
    await this.memoryBank.store(ewArtifact, 'current');

    // Step 3: Situational Awareness (SC-2)
    const geoInput: GeoData = geodata as GeoData || { lat: 42.36, lon: -71.06, population: 12500, criticalInfrastructure: ['Hospital'], shelterLocations: ['Center'] };
    const saArtifact = await this.situational.fuse(ewArtifact, geoInput);
    await this.memoryBank.store(saArtifact, 'short');

    // Step 4: Resource Allocation (SC-2 final output)
    const raArtifact = await this.resource.allocate(saArtifact);
    await this.memoryBank.store(raArtifact, 'long');

    return {
      taskGraph: plan,
      artifacts: [ewArtifact, saArtifact, raArtifact],
      finalPlan: raArtifact,
    };
  }

  async processHAMInput(aprsData: string): Promise<MemoryArtifact> {
    try {
      const event = await this.hamBridge.parseAPRS(aprsData);
      await this.memoryBank.store(event.payload, 'current');
      return event.payload;
    } catch (err) {
      if (err instanceof APRSParsingError) {
        // Log anomalous event to memory bank
        const errorArtifact: MemoryArtifact = {
          id: `error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          source: 'ham_bridge_error',
          data: { error: err.message, rawData: err.rawData },
          tags: ['error', 'anomaly', 'ham_bridge'],
        };
        await this.memoryBank.store(errorArtifact, 'short');
        throw err;
      }
      throw err;
    }
  }

  async broadcastViaHAM(plan: MemoryArtifact, mode: 'voice' | 'packet' = 'voice'): Promise<string> {
    if (mode === 'voice') {
      return this.voiceSynth.broadcastPlan(plan.data as { plan?: string; actions?: Array<{ type: string; target?: string }> }, 'NEXORA');
    } else {
      return this.packetRadio.encodeAX25('NEXORA', 'ALL', JSON.stringify(plan.data)).toString();
    }
  }

  getMemoryBank(): MemoryBank {
    return this.memoryBank;
  }

  getAgentRegistry(): AgentRegistry {
    return this.registry;
  }
}

export { MemoryArtifact, AgentSkill, AgentDomain };
export { TaskPlanner, AgentRegistry, MemoryBank };
export { EarlyWarningAgent, SituationalAwarenessAgent, ResourceAllocationAgent };
export { HAMBridgeService, VoiceSynthesizer, PacketRadioHandler };