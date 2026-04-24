import { AgentSkill, TaskGraph } from '../types';

export interface PlannerAdapter {
  generatePlan(query: string, availableSkills: AgentSkill[]): Promise<TaskGraph>;
}

export class SimplePlannerAdapter implements PlannerAdapter {
  async generatePlan(query: string, availableSkills: AgentSkill[]): Promise<TaskGraph> {
    const normalizedQuery = query.toLowerCase();

    if (normalizedQuery.includes('flood') || normalizedQuery.includes('warning')) {
      return this.buildFloodResponseGraph();
    }

    const firstMatch = availableSkills[0];
    if (!firstMatch) {
      return { tasks: [] };
    }

    return {
      tasks: [{
        id: `task_${Date.now()}`,
        agentId: firstMatch.id,
        dependencies: [],
        input: { query },
      }],
    };
  }

  private buildFloodResponseGraph(): TaskGraph {
    const earlyWarningTask = { id: 'ew_1', agentId: 'early_warning', dependencies: [], input: { hazard: 'flood' } };
    const situationalTask = { id: 'sa_1', agentId: 'situational_awareness', dependencies: ['ew_1'], input: {} };
    const resourceTask = { id: 'ra_1', agentId: 'resource_allocation', dependencies: ['ew_1', 'sa_1'], input: {} };

    return { tasks: [earlyWarningTask, situationalTask, resourceTask] };
  }
}

export class TaskPlanner {
  private adapter: PlannerAdapter;

  constructor(adapter: PlannerAdapter = new SimplePlannerAdapter()) {
    this.adapter = adapter;
  }

  async generatePlan(query: string, availableSkills: AgentSkill[] = []): Promise<TaskGraph> {
    return this.adapter.generatePlan(query, availableSkills);
  }
}