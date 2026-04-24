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
describe('ResourceAllocationAgent', () => {
    describe('allocate', () => {
        it('generates resource plan from situational data', async () => {
            const { ResourceAllocationAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/ResourceAllocationAgent')));
            const agent = new ResourceAllocationAgent();
            const situationalData = {
                id: 'sa-1',
                timestamp: new Date().toISOString(),
                source: 'situational_awareness',
                data: {
                    hazard: 'flood',
                    severity: 'HIGH',
                    affectedArea: 'Zone A',
                    affectedPopulation: 12500,
                    riskLevel: 75,
                    criticalInfrastructure: ['General Hospital', 'Elementary School'],
                    recommendedActions: ['Evacuate flood-prone zones'],
                },
                tags: ['situational', 'flood'],
                vector: [0.1, 0.2],
            };
            const result = await agent.allocate(situationalData);
            expect(result).not.toBeNull();
            expect(result.source).toBe('resource_allocation');
            expect(result.data).toHaveProperty('plan');
            expect(result.data).toHaveProperty('actions');
            expect(result.data).toHaveProperty('personnelRequired');
        });
        it('sizes personnel based on affected population', async () => {
            const { ResourceAllocationAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/ResourceAllocationAgent')));
            const agent = new ResourceAllocationAgent();
            const situational = {
                id: 'sa-pop',
                timestamp: new Date().toISOString(),
                source: 'situational_awareness',
                data: { hazard: 'flood', affectedPopulation: 10000, riskLevel: 70 },
                tags: ['situational'],
                vector: [],
            };
            const result = await agent.allocate(situational);
            const data = result.data;
            expect(data.personnelRequired).toBeGreaterThan(0);
        });
        it('routes supplies to critical infrastructure first', async () => {
            const { ResourceAllocationAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/ResourceAllocationAgent')));
            const agent = new ResourceAllocationAgent();
            const situational = {
                id: 'sa-infra',
                timestamp: new Date().toISOString(),
                source: 'situational_awareness',
                data: {
                    hazard: 'wildfire',
                    criticalInfrastructure: ['Hospital', 'Fire Station', 'School'],
                    affectedArea: 'Mountain View',
                },
                tags: ['situational'],
                vector: [],
            };
            const result = await agent.allocate(situational);
            const data = result.data;
            const infraAction = data.actions?.find(a => a.target === 'Hospital');
            expect(infraAction).toBeDefined();
        });
        it('produces SC-2 compliant supply plan', async () => {
            const { ResourceAllocationAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/ResourceAllocationAgent')));
            const agent = new ResourceAllocationAgent();
            const situational = {
                id: 'sa-sc2',
                timestamp: new Date().toISOString(),
                source: 'situational_awareness',
                data: {
                    hazard: 'flood',
                    affectedPopulation: 8500,
                    riskLevel: 65,
                    shelterLocations: ['Community Center', 'High School'],
                },
                tags: ['situational', 'flood'],
                vector: [0.3, 0.4],
            };
            const result = await agent.allocate(situational);
            expect(result.data).toHaveProperty('plan');
            expect(result.data).toHaveProperty('actions');
            expect(result.data).toHaveProperty('supplyList');
            expect(result.tags).toContain('resource');
            expect(result.tags).toContain('allocation');
        });
    });
    describe('optimizeRoutes', () => {
        it('calculates optimal supply delivery routes', async () => {
            const { ResourceAllocationAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/ResourceAllocationAgent')));
            const agent = new ResourceAllocationAgent();
            const locations = [
                { name: 'Shelter A', lat: 42.36, lon: -71.06 },
                { name: 'Shelter B', lat: 42.38, lon: -71.08 },
                { name: 'Staging Area', lat: 42.35, lon: -71.04 },
            ];
            const result = await agent.optimizeRoutes(locations);
            expect(result).toBeInstanceOf(Array);
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('from');
            expect(result[0]).toHaveProperty('to');
            expect(result[0]).toHaveProperty('distance');
        });
    });
    describe('HAM integration', () => {
        it('can format plan for HAM broadcast', async () => {
            const { ResourceAllocationAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/ResourceAllocationAgent')));
            const agent = new ResourceAllocationAgent();
            const situational = {
                id: 'sa-ham',
                timestamp: new Date().toISOString(),
                source: 'situational_awareness',
                data: { hazard: 'flood', affectedPopulation: 5000 },
                tags: ['situational'],
                vector: [],
            };
            const plan = await agent.allocate(situational);
            const broadcast = agent.formatForHAM(plan);
            expect(broadcast).toContain('EVACUATE');
            expect(broadcast.length).toBeLessThan(200);
        });
    });
});
//# sourceMappingURL=ResourceAllocationAgent.test.js.map