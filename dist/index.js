"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketRadioHandler = exports.VoiceSynthesizer = exports.HAMBridgeService = exports.ResourceAllocationAgent = exports.SituationalAwarenessAgent = exports.EarlyWarningAgent = exports.MemoryBank = exports.AgentRegistry = exports.TaskPlanner = exports.NexoraPipeline = void 0;
const TaskPlanner_1 = require("./orchestrator/TaskPlanner");
Object.defineProperty(exports, "TaskPlanner", { enumerable: true, get: function () { return TaskPlanner_1.TaskPlanner; } });
const AgentRegistry_1 = require("./orchestrator/AgentRegistry");
Object.defineProperty(exports, "AgentRegistry", { enumerable: true, get: function () { return AgentRegistry_1.AgentRegistry; } });
const MemoryBank_1 = require("./memory/MemoryBank");
Object.defineProperty(exports, "MemoryBank", { enumerable: true, get: function () { return MemoryBank_1.MemoryBank; } });
const EarlyWarningAgent_1 = require("./agents/EarlyWarningAgent");
Object.defineProperty(exports, "EarlyWarningAgent", { enumerable: true, get: function () { return EarlyWarningAgent_1.EarlyWarningAgent; } });
const SituationalAwarenessAgent_1 = require("./agents/SituationalAwarenessAgent");
Object.defineProperty(exports, "SituationalAwarenessAgent", { enumerable: true, get: function () { return SituationalAwarenessAgent_1.SituationalAwarenessAgent; } });
const ResourceAllocationAgent_1 = require("./agents/ResourceAllocationAgent");
Object.defineProperty(exports, "ResourceAllocationAgent", { enumerable: true, get: function () { return ResourceAllocationAgent_1.ResourceAllocationAgent; } });
const HAMBridgeService_1 = require("./ham/HAMBridgeService");
Object.defineProperty(exports, "HAMBridgeService", { enumerable: true, get: function () { return HAMBridgeService_1.HAMBridgeService; } });
const VoiceSynthesizer_1 = require("./ham/VoiceSynthesizer");
Object.defineProperty(exports, "VoiceSynthesizer", { enumerable: true, get: function () { return VoiceSynthesizer_1.VoiceSynthesizer; } });
const PacketRadioHandler_1 = require("./ham/PacketRadioHandler");
Object.defineProperty(exports, "PacketRadioHandler", { enumerable: true, get: function () { return PacketRadioHandler_1.PacketRadioHandler; } });
class NexoraPipeline {
    constructor() {
        this.planner = new TaskPlanner_1.TaskPlanner([]);
        this.registry = new AgentRegistry_1.AgentRegistry();
        this.memoryBank = new MemoryBank_1.MemoryBank();
        this.earlyWarning = new EarlyWarningAgent_1.EarlyWarningAgent();
        this.situational = new SituationalAwarenessAgent_1.SituationalAwarenessAgent();
        this.resource = new ResourceAllocationAgent_1.ResourceAllocationAgent();
        this.hamBridge = new HAMBridgeService_1.HAMBridgeService();
        this.voiceSynth = new VoiceSynthesizer_1.VoiceSynthesizer();
        this.packetRadio = new PacketRadioHandler_1.PacketRadioHandler();
        this.registerAgents();
    }
    registerAgents() {
        const agents = [
            { id: 'early_warning', domain: 'early_warning', description: 'Weather hazard prediction', inputSchema: {}, outputSchema: {} },
            { id: 'situational_awareness', domain: 'situational_awareness', description: 'Multi-modal fusion', inputSchema: {}, outputSchema: {} },
            { id: 'resource_allocation', domain: 'resource_allocation', description: 'Resource planning', inputSchema: {}, outputSchema: {} },
        ];
        agents.forEach(agent => this.registry.register(agent));
    }
    async runFullPipeline(query, weatherData, geodata) {
        // Step 1: Task Planning (SC-1)
        const plan = await this.planner.generatePlan(query);
        // Step 2: Early Warning
        const ewInput = weatherData || { stationId: 'AUTO-001', rainfall: 5, riverLevel: 18 };
        const ewArtifact = await this.earlyWarning.ingest(ewInput);
        await this.memoryBank.store(ewArtifact, 'current');
        // Step 3: Situational Awareness (SC-2)
        const geoInput = geodata || { lat: 42.36, lon: -71.06, population: 12500, criticalInfrastructure: ['Hospital'], shelterLocations: ['Center'] };
        const saArtifact = await this.situational.fuse(ewArtifact, geoInput);
        await this.memoryBank.store(saArtifact, 'short');
        // Step 4: Resource Allocation (SC-2 final output)
        const raArtifact = await this.resource.allocate(saArtifact);
        await this.memoryBank.store(raArtifact, 'long');
        return {
            taskGraph: plan,
            artifacts: [ewArtifact, saArtifact, raArtifact],
            finalPlan: raArtifact,
        };
    }
    async processHAMInput(aprsData) {
        const event = await this.hamBridge.parseAPRS(aprsData);
        if (!event)
            throw new Error('Invalid APRS format');
        await this.memoryBank.store(event.payload, 'current');
        return event.payload;
    }
    async broadcastViaHAM(plan, mode = 'voice') {
        if (mode === 'voice') {
            return this.voiceSynth.broadcastPlan(plan.data, 'NEXORA');
        }
        else {
            return this.packetRadio.encodeAX25('NEXORA', 'ALL', JSON.stringify(plan.data)).toString();
        }
    }
    getMemoryBank() {
        return this.memoryBank;
    }
    getAgentRegistry() {
        return this.registry;
    }
}
exports.NexoraPipeline = NexoraPipeline;
//# sourceMappingURL=index.js.map