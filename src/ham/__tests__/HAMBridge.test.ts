import { DisasterEvent } from '../../types';
import { APRSParsingError } from '../../types/errors';

describe('HAMBridgeService', () => {
  describe('parseAPRS', () => {
    it('parses standard APRS position report', async () => {
      const { HAMBridgeService } = await import('../../ham/HAMBridgeService');
      const bridge = new HAMBridgeService();

      const aprsData = 'KB1ABC>APRS,qAR,localhost:/4240.20N/07105.60W$Flash flood warning - Main St and Route 9';

      const event = await bridge.parseAPRS(aprsData);

      expect(event).not.toBeNull();
      expect(event?.payload.source).toBe('HAM_RADIO_KB1ABC');
      const data = event?.payload.data as { callsign?: string; message?: string; position?: { latitude: number; longitude: number } };
      expect(data?.callsign).toBe('KB1ABC');
      expect(data?.message).toContain('Flash flood warning');
    });

    it('extracts lat/lon from APRS coordinates', async () => {
      const { HAMBridgeService } = await import('../../ham/HAMBridgeService');
      const bridge = new HAMBridgeService();

      const aprsData = 'KB1XYZ>APRS,qAR,localhost:/4236.00N/07103.60W$Water rising - requesting evac';

      const event = await bridge.parseAPRS(aprsData);

      const data2 = event?.payload.data as { position?: { latitude: number; longitude: number } };
      expect(data2?.position?.latitude).toBe(42.6);
      expect(data2?.position?.longitude).toBe(-71.06);
    });

    it('throws APRSParsingError for malformed APRS', async () => {
      const { HAMBridgeService } = await import('../../ham/HAMBridgeService');
      const bridge = new HAMBridgeService();

      await expect(bridge.parseAPRS('INVALID_DATA')).rejects.toThrow(APRSParsingError);
    });
  });

  describe('voiceToText (mock)', () => {
    it('converts voice transcript to disaster event', async () => {
      const { HAMBridgeService } = await import('../../ham/HAMBridgeService');
      const bridge = new HAMBridgeService();

      const transcript = 'Emergency - flooding on Main Street - people trapped on second floor of building';

      const event = await bridge.voiceToText(transcript, 'KB2XYZ');

      expect(event).not.toBeNull();
      const data3 = event?.payload.data as { callsign?: string; message?: string };
      expect(data3?.callsign).toBe('KB2XYZ');
      expect(data3?.message).toBe(transcript);
      expect(event?.metadata.priority).toBe('critical');
    });
  });

  describe('broadcast', () => {
    it('serializes MemoryArtifact for radio transmission', async () => {
      const { HAMBridgeService } = await import('../../ham/HAMBridgeService');
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
      const { HAMBridgeService } = await import('../../ham/HAMBridgeService');
      const bridge = new HAMBridgeService();

      const event: DisasterEvent = {
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
      const { PacketRadioHandler } = await import('../../ham/PacketRadioHandler');
      const handler = new PacketRadioHandler();

      const frame = handler.encodeAX25('KB1ABC', 'NOCALL', 'EVAC ZONE A');

      expect(frame).toBeInstanceOf(Uint8Array);
      expect(frame.length).toBeGreaterThan(0);
    });
  });

  describe('decodeAX25', () => {
    it('decodes AX.25 frame to callsign and message', async () => {
      const { PacketRadioHandler } = await import('../../ham/PacketRadioHandler');
      const handler = new PacketRadioHandler();

      const frame = handler.encodeAX25('KB1ABC', 'NOCALL', 'TEST MSG');
      const decoded = handler.decodeAX25(frame);

      expect(decoded.source).toBe('KB1ABC');
      expect(decoded.message).toBe('TEST MSG');
    });
  });
});