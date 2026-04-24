import { AgentSkill, TaskGraph } from '../types';
export declare class TaskPlanner {
    private skills;
    constructor(skills: AgentSkill[]);
    generatePlan(query: string): Promise<TaskGraph>;
    private buildFloodResponseGraph;
}
//# sourceMappingURL=TaskPlanner.d.ts.map