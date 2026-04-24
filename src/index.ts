import { MemoryArtifact, AgentSkill, AgentDomain, GeoData, DisasterEvent } from './types';
import { APRSParsingError } from './types/errors';
import { TaskPlanner } from './orchestrator/TaskPlanner';
import { AgentRegistry } from './orchestrator/AgentRegistry';
import { UnifiedEventBus, globalEventBus } from './orchestrator/UnifiedEventBus';
import { MemoryBank } from './memory/MemoryBank';
import { EarlyWarningAgent } from './agents/EarlyWarningAgent';
import { SituationalAwarenessAgent } from './agents/SituationalAwarenessAgent';
import { ResourceAllocationAgent } from './agents/ResourceAllocationAgent';
import { HAMBridgeService } from './ham/HAMBridgeService';
import { VoiceSynthesizer } from './ham/VoiceSynthesizer';
import { PacketRadioHandler } from './ham/PacketRadioHandler';

// UEB Topics
export const UEB_TOPICS = {
  HAZARD_DETECTED: 'hazard.detected',
  SITUATIONAL_FUSION_COMPLETED: 'situational.fusion.completed',
  RESOURCE_PLAN_GENERATED: 'resource.plan.generated',
  PIPELINE_STARTED: 'pipeline.started',
  PIPELINE_COMPLETED: 'pipeline.completed',
} as const;

export class NexoraPipeline {
  private planner: TaskPlanner;
  private registry: AgentRegistry;
  private eventBus: UnifiedEventBus;
  private memoryBank: MemoryBank;
  private earlyWarning: EarlyWarningAgent;
  private situational: SituationalAwarenessAgent;
  private resource: ResourceAllocationAgent;
  private hamBridge: HAMBridgeService;
  private voiceSynth: VoiceSynthesizer;
  private packetRadio: PacketRadioHandler;
  private subscriptions: Array<() => void> = [];

  constructor(eventBus: UnifiedEventBus = globalEventBus) {
    this.eventBus = eventBus;
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
    this.setupSubscriptions();
  }

  private registerAgents(): void {
    const agents: AgentSkill[] = [
      { id: 'early_warning', domain: 'early_warning', description: 'Weather hazard prediction', inputSchema: {}, outputSchema: {} },
      { id: 'situational_awareness', domain: 'situational_awareness', description: 'Multi-modal fusion', inputSchema: {}, outputSchema: {} },
      { id: 'resource_allocation', domain: 'resource_allocation', description: 'Resource planning', inputSchema: {}, outputSchema: {} },
    ];

    agents.forEach(agent => this.registry.register(agent));
  }

  private setupSubscriptions(): void {
    // Early Warning -> publishes hazard.detected
    // Situational subscribes to hazard.detected and publishes situational.fusion.completed
    // Resource subscribes to situational.fusion.completed and publishes resource.plan.generated

    const ewSubscription = this.eventBus.subscribe(UEB_TOPICS.HAZARD_DETECTED, async (data) => {
      const event = data as { artifact: MemoryArtifact; weatherData: unknown };
      await this.memoryBank.store(event.artifact, 'current');
    });
    this.subscriptions.push(ewSubscription);

    const saSubscription = this.eventBus.subscribe(UEB_TOPICS.SITUATIONAL_FUSION_COMPLETED, async (data) => {
      const event = data as { artifact: MemoryArtifact };
      await this.memoryBank.store(event.artifact, 'short');
    });
    this.subscriptions.push(saSubscription);

    const raSubscription = this.eventBus.subscribe(UEB_TOPICS.RESOURCE_PLAN_GENERATED, async (data) => {
      const event = data as { artifact: MemoryArtifact };
      await this.memoryBank.store(event.artifact, 'long');
    });
    this.subscriptions.push(raSubscription);
  }

  async runFullPipeline(query: string, weatherData?: unknown, geodata?: unknown): Promise<{
    taskGraph: { tasks: Array<{ id: string; agentId: string; dependencies: string[] }> };
    artifacts: MemoryArtifact[];
    finalPlan: MemoryArtifact | null;
  }> {
    // Step 1: Task Planning (SC-1)
    const plan = await this.planner.generatePlan(query);
    this.eventBus.publish(UEB_TOPICS.PIPELINE_STARTED, { query, timestamp: new Date().toISOString() });

    const artifacts: MemoryArtifact[] = [];

    // Step 2: Early Warning - Publish to UEB instead of direct call
    const ewInput = weatherData || { stationId: 'AUTO-001', rainfall: 5, riverLevel: 18 };
    const ewArtifact = await this.earlyWarning.ingest(ewInput);
    artifacts.push(ewArtifact);

    const hazardEvent: DisasterEvent = {
      id: `evt-${Date.now()}`,
      topic: 'hazard.detected',
      payload: ewArtifact,
      metadata: { priority: 'high', isLocal: true },
    };
    this.eventBus.publish(UEB_TOPICS.HAZARD_DETECTED, { artifact: ewArtifact, weatherData: ewInput, event: hazardEvent });

    // Step 3: Situational Awareness - Subscribed via UEB, but we need to trigger it
    const geoInput: GeoData = geodata as GeoData || { lat: 42.36, lon: -71.06, population: 12500, criticalInfrastructure: ['Hospital'], shelterLocations: ['Center'] };
    const saArtifact = await this.situational.fuse(ewArtifact, geoInput);
    artifacts.push(saArtifact);

    const fusionEvent: DisasterEvent = {
      id: `evt-${Date.now()}`,
      topic: 'situational.fusion.completed',
      payload: saArtifact,
      metadata: { priority: 'high', isLocal: true },
    };
    this.eventBus.publish(UEB_TOPICS.SITUATIONAL_FUSION_COMPLETED, { artifact: saArtifact, geoData: geoInput, event: fusionEvent });

    // Step 4: Resource Allocation - Subscribed via UEB
    const raArtifact = await this.resource.allocate(saArtifact);
    artifacts.push(raArtifact);

    const resourceEvent: DisasterEvent = {
      id: `evt-${Date.now()}`,
      topic: 'resource.plan.generated',
      payload: raArtifact,
      metadata: { priority: 'high', isLocal: true },
    };
    this.eventBus.publish(UEB_TOPICS.RESOURCE_PLAN_GENERATED, { artifact: raArtifact, event: resourceEvent });

    this.eventBus.publish(UEB_TOPICS.PIPELINE_COMPLETED, { artifacts, timestamp: new Date().toISOString() });

    return {
      taskGraph: plan,
      artifacts,
      finalPlan: raArtifact,
    };
  }

  // Legacy sync method for backward compatibility
  async runPipelineSync(query: string, weatherData?: unknown, geodata?: unknown): Promise<{
    taskGraph: { tasks: Array<{ id: string; agentId: string; dependencies: string[] }> };
    artifacts: MemoryArtifact[];
    finalPlan: MemoryArtifact | null;
  }> {
    return this.runFullPipeline(query, weatherData, geodata);
  }

  // Subscribe to UEB topics externally
  subscribe(topic: string, callback: (data: unknown) => void): () => void {
    return this.eventBus.subscribe(topic, callback);
  }

  // Get event bus for monitoring
  getEventBus(): UnifiedEventBus {
    return this.eventBus;
  }

  async processHAMInput(aprsData: string): Promise<MemoryArtifact> {
    try {
      const event = await this.hamBridge.parseAPRS(aprsData);
      await this.memoryBank.store(event.payload, 'current');
      return event.payload;
    } catch (err) {
      if (err instanceof APRSParsingError) {
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

  destroy(): void {
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];
  }
}

export { MemoryArtifact, AgentSkill, AgentDomain, DisasterEvent };
export { TaskPlanner, AgentRegistry, MemoryBank, UnifiedEventBus, globalEventBus };
export { EarlyWarningAgent, SituationalAwarenessAgent, ResourceAllocationAgent };
export { HAMBridgeService, VoiceSynthesizer, PacketRadioHandler };
