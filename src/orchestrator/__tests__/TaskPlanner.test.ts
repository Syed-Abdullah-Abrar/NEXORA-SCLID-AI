import { AgentSkill, Task } from '../../types';

describe('TaskPlanner', () => {
  describe('generatePlan', () => {
    it('should decompose "Flood Response" query into 3-step dependency graph', async () => {
      const skills: AgentSkill[] = [
        {
          id: 'early_warning',
          domain: 'early_warning',
          description: 'Predicts hazards from sensor/weather data',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
        },
        {
          id: 'situational_awareness',
          domain: 'situational_awareness',
          description: 'Fuses multi-modal data for live operational picture',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
        },
        {
          id: 'resource_allocation',
          domain: 'resource_allocation',
          description: 'Optimizes distribution of personnel and supplies',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
        },
      ];

      const { TaskPlanner } = await import('../TaskPlanner');
      const planner = new TaskPlanner(skills);

      const result = await planner.generatePlan('Flood Response');

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0].agentId).toBe('early_warning');
      expect(result.tasks[1].agentId).toBe('situational_awareness');
      expect(result.tasks[2].agentId).toBe('resource_allocation');

      // Verify dependency chain: situational depends on early_warning output
      const situationalTask = result.tasks.find((t: Task) => t.agentId === 'situational_awareness');
      expect(situationalTask?.dependencies).toContain(result.tasks[0].id);

      // Verify resource depends on both prior outputs
      const resourceTask = result.tasks.find((t: Task) => t.agentId === 'resource_allocation');
      expect(resourceTask?.dependencies).toContain(result.tasks[0].id);
      expect(resourceTask?.dependencies).toContain(result.tasks[1].id);
    });

    it('should complete decomposition within 2 seconds', async () => {
      const skills: AgentSkill[] = [
        {
          id: 'early_warning',
          domain: 'early_warning',
          description: 'Predicts hazards',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
        },
      ];

      const { TaskPlanner } = await import('../TaskPlanner');
      const planner = new TaskPlanner(skills);

      const start = Date.now();
      await planner.generatePlan('Flood Response');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
    });
  });
});

describe('AgentRegistry', () => {
  describe('register', () => {
    it('should register a new agent and return it by domain', async () => {
      const { AgentRegistry } = await import('../AgentRegistry');
      const registry = new AgentRegistry();

      const skill: AgentSkill = {
        id: 'test_agent',
        domain: 'early_warning',
        description: 'Test agent',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
      };

      registry.register(skill);

      const retrieved = registry.getByDomain('early_warning');
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].id).toBe('test_agent');
    });

    it('should return empty array for unregistered domain', async () => {
      const { AgentRegistry } = await import('../AgentRegistry');
      const registry = new AgentRegistry();

      const result = registry.getByDomain('resource_allocation');
      expect(result).toHaveLength(0);
    });
  });

  describe('discover', () => {
    it('should find agents matching query intent', async () => {
      const { AgentRegistry } = await import('../AgentRegistry');
      const registry = new AgentRegistry();

      registry.register({
        id: 'early_warning',
        domain: 'early_warning',
        description: 'Weather hazard prediction',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
      });

      const matches = registry.discover('flood warning weather alert');
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});