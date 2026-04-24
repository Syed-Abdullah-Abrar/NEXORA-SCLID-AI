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
describe('SituationalAwarenessAgent', () => {
    describe('fuse', () => {
        it('combines early warning data with geolocation', async () => {
            const { SituationalAwarenessAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/SituationalAwarenessAgent')));
            const agent = new SituationalAwarenessAgent();
            const earlyWarning = {
                id: 'ew-1',
                timestamp: new Date().toISOString(),
                source: 'early_warning',
                data: { hazard: 'flood', severity: 'HIGH', affectedArea: 'Zone A' },
                tags: ['early_warning', 'flood'],
                vector: [0.1, 0.2, 0.3],
            };
            const geodata = {
                lat: 42.36,
                lon: -71.06,
                population: 15000,
                criticalInfrastructure: ['hospital', 'school'],
            };
            const result = await agent.fuse(earlyWarning, geodata);
            expect(result).not.toBeNull();
            expect(result.source).toBe('situational_awareness');
            expect(result.data).toHaveProperty('unifiedPicture');
            expect(result.data).toHaveProperty('riskLevel');
            expect(result.tags).toContain('situational');
        });
        it('calculates total affected population from multiple sources', async () => {
            const { SituationalAwarenessAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/SituationalAwarenessAgent')));
            const agent = new SituationalAwarenessAgent();
            const ewa1 = {
                id: 'ew-1',
                timestamp: new Date().toISOString(),
                source: 'early_warning',
                data: { hazard: 'flood', severity: 'HIGH', affectedArea: 'Zone A', populationAtRisk: 5000 },
                tags: ['early_warning'],
                vector: [],
            };
            const ewa2 = {
                id: 'ew-2',
                timestamp: new Date().toISOString(),
                source: 'early_warning',
                data: { hazard: 'flood', severity: 'HIGH', affectedArea: 'Zone B', populationAtRisk: 8000 },
                tags: ['early_warning'],
                vector: [],
            };
            const geodata = { lat: 42.36, lon: -71.06, population: 50000 };
            const result = await agent.fuseMultiple([ewa1, ewa2], geodata);
            const data = result.data;
            expect(data.totalAffected).toBeGreaterThanOrEqual(13000);
        });
        it('identifies critical infrastructure in hazard zone', async () => {
            const { SituationalAwarenessAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/SituationalAwarenessAgent')));
            const agent = new SituationalAwarenessAgent();
            const earlyWarning = {
                id: 'ew-1',
                timestamp: new Date().toISOString(),
                source: 'early_warning',
                data: { hazard: 'flood', severity: 'CRITICAL', affectedArea: 'Downtown' },
                tags: ['early_warning'],
                vector: [],
            };
            const geodata = {
                lat: 42.35,
                lon: -71.05,
                criticalInfrastructure: ['General Hospital', 'Fire Station 3', 'Elementary School'],
                shelterLocations: ['Community Center', 'High School Gym'],
            };
            const result = await agent.fuse(earlyWarning, geodata);
            const data = result.data;
            expect(data.criticalInfrastructure).toBeDefined();
            expect(data.criticalInfrastructure?.length).toBeGreaterThan(0);
        });
        it('generates unified situational artifact with priority', async () => {
            const { SituationalAwarenessAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/SituationalAwarenessAgent')));
            const agent = new SituationalAwarenessAgent();
            const earlyWarning = {
                id: 'ew-1',
                timestamp: new Date().toISOString(),
                source: 'early_warning',
                data: { hazard: 'wildfire', severity: 'HIGH', affectedArea: 'Forest Zone' },
                tags: ['early_warning'],
                vector: [],
            };
            const geodata = {
                lat: 38.9,
                lon: -120.0,
                population: 3000,
                criticalInfrastructure: ['Ranger Station'],
            };
            const result = await agent.fuse(earlyWarning, geodata);
            expect(result.data).toHaveProperty('unifiedPicture');
            expect(result.data).toHaveProperty('riskLevel');
            expect(result.data).toHaveProperty('recommendedActions');
            expect(result.tags).toContain('situational');
        });
    });
    describe('SC-2 compliance', () => {
        it('produces artifact that Resource Allocation can use', async () => {
            const { SituationalAwarenessAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/SituationalAwarenessAgent')));
            const agent = new SituationalAwarenessAgent();
            const ewa = {
                id: 'ew-flood',
                timestamp: new Date().toISOString(),
                source: 'early_warning',
                data: { hazard: 'flood', severity: 'HIGH', affectedArea: 'Zone A' },
                tags: ['early_warning', 'flood'],
                vector: [0.1, 0.2],
            };
            const geo = { lat: 42.36, lon: -71.06, population: 12500, shelterLocations: ['Center A'] };
            const result = await agent.fuse(ewa, geo);
            expect(result.data).toHaveProperty('unifiedPicture');
            expect(result.tags).toContain('situational');
            expect(result.tags).toContain('flood');
        });
    });
});
//# sourceMappingURL=SituationalAwarenessAgent.test.js.map