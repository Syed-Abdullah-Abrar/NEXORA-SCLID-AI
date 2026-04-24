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
describe('EarlyWarningAgent', () => {
    describe('ingest', () => {
        it('processes weather sensor data and generates hazard alert', async () => {
            const { EarlyWarningAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/EarlyWarningAgent')));
            const agent = new EarlyWarningAgent();
            const weatherData = {
                stationId: 'WS-42',
                temperature: 72,
                humidity: 95,
                pressure: 29.2,
                rainfall: 4.5,
                windSpeed: 35,
                riverLevel: 18.5,
            };
            const result = await agent.ingest(weatherData);
            expect(result).not.toBeNull();
            expect(result.source).toBe('early_warning');
            expect(result.data).toHaveProperty('hazard');
            expect(result.data).toHaveProperty('severity');
            expect(result.data).toHaveProperty('confidence');
        });
        it('detects flood conditions from river level and rainfall', async () => {
            const { EarlyWarningAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/EarlyWarningAgent')));
            const agent = new EarlyWarningAgent();
            const floodData = {
                stationId: 'FLOOD-01',
                rainfall: 6.0,
                riverLevel: 22.0,
                forecast: 'heavy_rain',
            };
            const result = await agent.ingest(floodData);
            const data = result.data;
            expect(data.hazard?.toLowerCase()).toContain('flood');
            expect(data.severity).toBe('CRITICAL');
        });
        it('detects wildfire conditions from temperature and humidity', async () => {
            const { EarlyWarningAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/EarlyWarningAgent')));
            const agent = new EarlyWarningAgent();
            const fireData = {
                stationId: 'FOREST-12',
                temperature: 98,
                humidity: 15,
                windSpeed: 25,
                fuelMoisture: 5,
            };
            const result = await agent.ingest(fireData);
            const data = result.data;
            expect(data.hazard?.toLowerCase()).toContain('fire');
        });
        it('returns low priority for benign conditions', async () => {
            const { EarlyWarningAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/EarlyWarningAgent')));
            const agent = new EarlyWarningAgent();
            const safeData = {
                stationId: 'SAFE-01',
                temperature: 68,
                humidity: 50,
                rainfall: 0,
            };
            const result = await agent.ingest(safeData);
            const data = result.data;
            expect(data.hazard).toBe('none');
        });
    });
    describe('SC-1 compliance', () => {
        it('produces output that can feed into situational awareness', async () => {
            const { EarlyWarningAgent } = await Promise.resolve().then(() => __importStar(require('../../agents/EarlyWarningAgent')));
            const agent = new EarlyWarningAgent();
            const data = { stationId: 'TEST', rainfall: 5, riverLevel: 20 };
            const artifact = await agent.ingest(data);
            expect(artifact.tags).toContain('early_warning');
            expect(artifact.tags).toContain('hazard');
            expect(artifact.vector).toBeInstanceOf(Array);
        });
    });
});
//# sourceMappingURL=EarlyWarningAgent.test.js.map