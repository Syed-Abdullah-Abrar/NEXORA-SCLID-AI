"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
describe('TaskPlanner', () => {
    describe('generatePlan', () => {
        it('should decompose "Flood Response" query into 3-step dependency graph', async () => {
            const skills = [
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
            const { TaskPlanner } = await Promise.resolve().then(() => __importStar(require('../TaskPlanner')));
            const planner = new TaskPlanner(skills);
            const result = await planner.generatePlan('Flood Response');
            expect(result.tasks).toHaveLength(3);
            expect(result.tasks[0].agentId).toBe('early_warning');
            expect(result.tasks[1].agentId).toBe('situational_awareness');
            expect(result.tasks[2].agentId).toBe('resource_allocation');
            // Verify dependency chain: situational depends on early_warning output
            const situationalTask = result.tasks.find((t) => t.agentId === 'situational_awareness');
            expect(situationalTask?.dependencies).toContain(result.tasks[0].id);
            // Verify resource depends on both prior outputs
            const resourceTask = result.tasks.find((t) => t.agentId === 'resource_allocation');
            expect(resourceTask?.dependencies).toContain(result.tasks[0].id);
            expect(resourceTask?.dependencies).toContain(result.tasks[1].id);
        });
        it('should complete decomposition within 2 seconds', async () => {
            const skills = [
                {
                    id: 'early_warning',
                    domain: 'early_warning',
                    description: 'Predicts hazards',
                    inputSchema: { type: 'object' },
                    outputSchema: { type: 'object' },
                },
            ];
            const { TaskPlanner } = await Promise.resolve().then(() => __importStar(require('../TaskPlanner')));
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
            const { AgentRegistry } = await Promise.resolve().then(() => __importStar(require('../AgentRegistry')));
            const registry = new AgentRegistry();
            const skill = {
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
            const { AgentRegistry } = await Promise.resolve().then(() => __importStar(require('../AgentRegistry')));
            const registry = new AgentRegistry();
            const result = registry.getByDomain('resource_allocation');
            expect(result).toHaveLength(0);
        });
    });
    describe('discover', () => {
        it('should find agents matching query intent', async () => {
            const { AgentRegistry } = await Promise.resolve().then(() => __importStar(require('../AgentRegistry')));
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
//# sourceMappingURL=TaskPlanner.test.js.map