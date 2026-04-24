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
describe('HAMBridgeService', () => {
    describe('parseAPRS', () => {
        it('parses standard APRS position report', async () => {
            const { HAMBridgeService } = await Promise.resolve().then(() => __importStar(require('../../ham/HAMBridgeService')));
            const bridge = new HAMBridgeService();
            const aprsData = 'KB1ABC>APRS,qAR,localhost:/4240.20N/07105.60W$Flash flood warning - Main St and Route 9';
            const event = await bridge.parseAPRS(aprsData);
            expect(event).not.toBeNull();
            expect(event?.payload.source).toBe('HAM_RADIO_KB1ABC');
            const data = event?.payload.data;
            expect(data?.callsign).toBe('KB1ABC');
            expect(data?.message).toContain('Flash flood warning');
        });
        it('extracts lat/lon from APRS coordinates', async () => {
            const { HAMBridgeService } = await Promise.resolve().then(() => __importStar(require('../../ham/HAMBridgeService')));
            const bridge = new HAMBridgeService();
            const aprsData = 'KB1XYZ>APRS,qAR,localhost:/4236.00N/07103.60W$Water rising - requesting evac';
            const event = await bridge.parseAPRS(aprsData);
            const data2 = event?.payload.data;
            expect(data2?.position?.latitude).toBe(42.6);
            expect(data2?.position?.longitude).toBe(-71.06);
        });
        it('returns null for malformed APRS', async () => {
            const { HAMBridgeService } = await Promise.resolve().then(() => __importStar(require('../../ham/HAMBridgeService')));
            const bridge = new HAMBridgeService();
            const result = await bridge.parseAPRS('INVALID_DATA');
            expect(result).toBeNull();
        });
    });
    describe('voiceToText (mock)', () => {
        it('converts voice transcript to disaster event', async () => {
            const { HAMBridgeService } = await Promise.resolve().then(() => __importStar(require('../../ham/HAMBridgeService')));
            const bridge = new HAMBridgeService();
            const transcript = 'Emergency - flooding on Main Street - people trapped on second floor of building';
            const event = await bridge.voiceToText(transcript, 'KB2XYZ');
            expect(event).not.toBeNull();
            const data3 = event?.payload.data;
            expect(data3?.callsign).toBe('KB2XYZ');
            expect(data3?.message).toBe(transcript);
            expect(event?.metadata.priority).toBe('critical');
        });
    });
    describe('broadcast', () => {
        it('serializes MemoryArtifact for radio transmission', async () => {
            const { HAMBridgeService } = await Promise.resolve().then(() => __importStar(require('../../ham/HAMBridgeService')));
            const bridge = new HAMBridgeService();
            const artifact = {
                id: 'ra-output-1',
                timestamp: new Date().toISOString(),
                source: 'resource_allocation',
                data: {
                    plan: 'EVACUATE_ZONE_A',
                    actions: ['Deploy 45 personnel', 'Setup shelter at Community Center'],
                },
                tags: ['resource'],
            };
            const broadcast = await bridge.broadcast(artifact);
            expect(broadcast).toContain('EVACUATE_ZONE_A');
            expect(broadcast).toContain('45 personnel');
        });
    });
    describe('formatAPRS', () => {
        it('encodes resource plan as APRS message', async () => {
            const { HAMBridgeService } = await Promise.resolve().then(() => __importStar(require('../../ham/HAMBridgeService')));
            const bridge = new HAMBridgeService();
            const event = {
                id: 'test-1',
                topic: 'resource.plan.generated',
                payload: {
                    id: 'ra-1',
                    timestamp: new Date().toISOString(),
                    source: 'resource_allocation',
                    data: { plan: 'EVACUATE', priority: 1 },
                    tags: [],
                },
                metadata: { priority: 'critical', isLocal: true },
            };
            const aprs = bridge.formatAPRS(event, 'NEXORA');
            expect(aprs).toContain('NEXORA');
            expect(aprs).toContain('EVACUATE');
        });
    });
});
describe('PacketRadioHandler', () => {
    describe('encodeAX25', () => {
        it('encodes callsign in AX.25 format', async () => {
            const { PacketRadioHandler } = await Promise.resolve().then(() => __importStar(require('../../ham/PacketRadioHandler')));
            const handler = new PacketRadioHandler();
            const frame = handler.encodeAX25('KB1ABC', 'NOCALL', 'EVAC ZONE A');
            expect(frame).toBeInstanceOf(Uint8Array);
            expect(frame.length).toBeGreaterThan(0);
        });
    });
    describe('decodeAX25', () => {
        it('decodes AX.25 frame to callsign and message', async () => {
            const { PacketRadioHandler } = await Promise.resolve().then(() => __importStar(require('../../ham/PacketRadioHandler')));
            const handler = new PacketRadioHandler();
            const frame = handler.encodeAX25('KB1ABC', 'NOCALL', 'TEST MSG');
            const decoded = handler.decodeAX25(frame);
            expect(decoded.source).toBe('KB1ABC');
            expect(decoded.message).toBe('TEST MSG');
        });
    });
});
//# sourceMappingURL=HAMBridge.test.js.map