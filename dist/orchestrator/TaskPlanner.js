"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPlanner = void 0;
class TaskPlanner {
    constructor(skills) {
        this.skills = skills;
    }
    async generatePlan(query) {
        const normalizedQuery = query.toLowerCase();
        if (normalizedQuery.includes('flood') || normalizedQuery.includes('warning')) {
            return this.buildFloodResponseGraph();
        }
        // Default: single task for the first matching skill
        const firstMatch = this.skills[0];
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
    buildFloodResponseGraph() {
        const earlyWarningTask = { id: 'ew_1', agentId: 'early_warning', dependencies: [], input: { hazard: 'flood' } };
        const situationalTask = { id: 'sa_1', agentId: 'situational_awareness', dependencies: ['ew_1'], input: {} };
        const resourceTask = { id: 'ra_1', agentId: 'resource_allocation', dependencies: ['ew_1', 'sa_1'], input: {} };
        return { tasks: [earlyWarningTask, situationalTask, resourceTask] };
    }
}
exports.TaskPlanner = TaskPlanner;
//# sourceMappingURL=TaskPlanner.js.map