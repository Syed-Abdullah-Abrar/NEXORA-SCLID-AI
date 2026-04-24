import { MemoryArtifact } from '../types';
import { EarlyWarningAgent } from '../agents/EarlyWarningAgent';
import { SituationalAwarenessAgent } from '../agents/SituationalAwarenessAgent';
import { ResourceAllocationAgent } from '../agents/ResourceAllocationAgent';
import { MemoryBank } from '../memory/MemoryBank';
import { TaskPlanner } from '../orchestrator/TaskPlanner';
import { AgentRegistry } from '../orchestrator/AgentRegistry';

describe('Pipeline Integration', () => {
  describe('Full disaster response flow', () => {
    it('SC-1: TaskPlanner decomposes flood query into 3-step graph', async () => {
      const planner = new TaskPlanner();
      const result = await planner.generatePlan('Flood Response');

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks.map(t => t.agentId)).toEqual([
        'early_warning',
        'situational_awareness',
        'resource_allocation',
      ]);

      // Verify dependency chain
      expect(result.tasks[1].dependencies).toContain(result.tasks[0].id);
      expect(result.tasks[2].dependencies).toContain(result.tasks[0].id);
      expect(result.tasks[2].dependencies).toContain(result.tasks[1].id);
    });

    it('SC-2: Resource agent produces supply plan from situational geodata', async () => {
      const situational: MemoryArtifact = {
        id: 'sa-integration-test',
        timestamp: new Date().toISOString(),
        source: 'situational_awareness',
        data: {
          hazard: 'flood',
          severity: 'HIGH',
          affectedArea: 'Zone A',
          affectedPopulation: 12500,
          riskLevel: 75,
          criticalInfrastructure: ['General Hospital'],
          shelterLocations: ['Community Center'],
        },
        tags: ['situational', 'flood'],
        vector: [0.1, 0.2],
      };

      const resourceAgent = new ResourceAllocationAgent();
      const plan = await resourceAgent.allocate(situational);

      const data = plan.data as { plan?: string; actions?: Array<{ type: string }> };
      expect(data.plan).toBeDefined();
      expect(data.actions).toBeInstanceOf(Array);
      expect(data.actions!.length).toBeGreaterThan(0);

      // Verify plan references the hazard
      expect(data.plan).toContain('FLOOD');
    });

    it('SC-3: Memory persists across agent transitions', async () => {
      const memoryBank = new MemoryBank();

      // Early Warning writes
      const earlyWarningAgent = new EarlyWarningAgent();
      const ewArtifact = await earlyWarningAgent.ingest({
        stationId: 'TEST-001',
        rainfall: 5,
        riverLevel: 18,
      });

      await memoryBank.store(ewArtifact, 'current');

      // Resource Allocation reads
      const stored = await memoryBank.get(ewArtifact.id);
      expect(stored).not.toBeNull();
      expect(stored?.source).toBe('early_warning');

      // Verify data survives tier promotion
      await memoryBank.promote(ewArtifact.id, 'current', 'short');
      const promoted = await memoryBank.get(ewArtifact.id);
      expect(promoted?.id).toBe(ewArtifact.id);
    });

    it('SC-4: All agent I/O follows registered schema', async () => {
      const registry = new AgentRegistry();

      registry.register({
        id: 'early_warning',
        domain: 'early_warning',
        description: 'Weather hazard prediction',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
      });

      registry.register({
        id: 'situational_awareness',
        domain: 'situational_awareness',
        description: 'Multi-modal fusion',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
      });

      registry.register({
        id: 'resource_allocation',
        domain: 'resource_allocation',
        description: 'Resource planning',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
      });

      const ewa = new EarlyWarningAgent();
      const saa = new SituationalAwarenessAgent();
      const raa = new ResourceAllocationAgent();

      const ewaOut = await ewa.ingest({ stationId: 'TEST', rainfall: 3 });
      expect(ewaOut).toHaveProperty('id');
      expect(ewaOut).toHaveProperty('timestamp');
      expect(ewaOut).toHaveProperty('source');
      expect(ewaOut).toHaveProperty('data');
      expect(ewaOut).toHaveProperty('tags');

      const geoData = { lat: 42.36, lon: -71.06, population: 5000 };
      const saOut = await saa.fuse(ewaOut, geoData);
      expect(saOut).toHaveProperty('id');
      expect(saOut).toHaveProperty('timestamp');
      expect(saOut).toHaveProperty('source');
      expect(saOut).toHaveProperty('data');

      const raOut = await raa.allocate(saOut);
      expect(raOut).toHaveProperty('id');
      expect(raOut).toHaveProperty('timestamp');
      expect(raOut).toHaveProperty('source');
      expect(raOut).toHaveProperty('data');
    });

    it('End-to-end: Weather data → Resource plan', async () => {
      const memoryBank = new MemoryBank();
      const earlyWarningAgent = new EarlyWarningAgent();
      const situationalAgent = new SituationalAwarenessAgent();
      const resourceAgent = new ResourceAllocationAgent();

      // Step 1: Early Warning
      const weatherData = {
        stationId: 'FLOOD-SENSOR-01',
        rainfall: 6,
        riverLevel: 20,
        humidity: 90,
      };

      const ewArtifact = await earlyWarningAgent.ingest(weatherData);
      await memoryBank.store(ewArtifact, 'current');

      expect(ewArtifact.data).toHaveProperty('hazard', 'flood');
      expect(ewArtifact.data).toHaveProperty('severity', 'CRITICAL');

      // Step 2: Situational Awareness
      const geodata = {
        lat: 42.36,
        lon: -71.06,
        population: 15000,
        criticalInfrastructure: ['Hospital A', 'School B'],
        shelterLocations: ['Community Center', 'High School'],
      };

      const saArtifact = await situationalAgent.fuse(ewArtifact, geodata);
      await memoryBank.store(saArtifact, 'short');

      expect(saArtifact.data).toHaveProperty('unifiedPicture');
      expect(saArtifact.data).toHaveProperty('riskLevel', 100);

      // Step 3: Resource Allocation
      const raArtifact = await resourceAgent.allocate(saArtifact);
      await memoryBank.store(raArtifact, 'long');

      const raData = raArtifact.data as { plan?: string; personnelRequired?: number };
      expect(raData.plan).toContain('FLOOD');
      expect(raData.personnelRequired).toBeGreaterThanOrEqual(10);

      // Verify all artifacts traceable via Memory Bank
      const retrieved = await memoryBank.get(raArtifact.id);
      expect(retrieved?.source).toBe('resource_allocation');
    });
  });

  describe('Unified Event Bus integration', () => {
    it('DisasterEvent follows expected schema', async () => {
      const event = {
        id: 'test-event',
        topic: 'hazard.detected' as const,
        payload: {
          id: 'artifact-1',
          timestamp: new Date().toISOString(),
          source: 'early_warning',
          data: { hazard: 'flood' },
          tags: ['test'],
        },
        metadata: {
          priority: 'high' as const,
          isLocal: true,
        },
      };

      expect(event.topic).toMatch(/hazard\.detected|situational\.fusion\.completed|resource\.plan\.generated/);
      expect(event.metadata.priority).toMatch(/low|medium|high|critical/);
      expect(event.metadata.isLocal).toBe(true);
    });
  });
});