import { DisasterEvent, MemoryArtifact } from '../types';
import { APRSParsingError } from '../types/errors';

export class HAMBridgeService {
  async parseAPRS(raw: string): Promise<DisasterEvent> {
    const aprsRegex = /^([A-Z0-9]+)>[^\/]+\/([^$]+)\$([^\r\n]+)/;
    const match = raw.match(aprsRegex);

    if (!match) {
      throw new APRSParsingError(`Invalid APRS format: ${raw.substring(0, 50)}...`, raw);
    }

    const [, callsign, coords, message] = match;
    const position = this.parseCoordinates(coords);

    return {
      id: `ham-${Date.now()}`,
      topic: 'hazard.detected',
      payload: {
        id: `ham-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: `HAM_RADIO_${callsign}`,
        data: { callsign, position, message },
        tags: ['ham', 'aprs', 'field-report'],
      },
      metadata: {
        priority: message.toLowerCase().includes('emergency') ? 'critical' : 'high',
        isLocal: true,
      },
    };
  }

  private parseCoordinates(coords: string): { latitude: number; longitude: number } | null {
    const latMatch = coords.match(/(\d{2})(\d{2}\.\d{2})([NS])/);
    const lonMatch = coords.match(/(\d{3})(\d{2}\.\d{2})([EW])/);

    if (!latMatch || !lonMatch) return null;

    let lat = parseInt(latMatch[1]) + parseFloat(latMatch[2]) / 60;
    if (latMatch[3] === 'S') lat = -lat;

    let lon = parseInt(lonMatch[1]) + parseFloat(lonMatch[2]) / 60;
    if (lonMatch[3] === 'W') lon = -lon;

    return { latitude: Math.round(lat * 100) / 100, longitude: Math.round(lon * 100) / 100 };
  }

  async voiceToText(transcript: string, callsign: string): Promise<DisasterEvent> {
    const priority = transcript.toLowerCase().includes('emergency') ||
      transcript.toLowerCase().includes('trapped') ? 'critical' : 'high';

    return {
      id: `ham-${Date.now()}`,
      topic: 'hazard.detected',
      payload: {
        id: `ham-${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: `HAM_RADIO_${callsign}`,
        data: { callsign, message: transcript, mode: 'voice' },
        tags: ['ham', 'voice', 'field-report'],
      },
      metadata: { priority, isLocal: true },
    };
  }

  async broadcast(artifact: MemoryArtifact): Promise<string> {
    const data = artifact.data as { plan?: string; actions?: string[] };
    const lines = [
      `NEXORA: ${data.plan || 'Resource Update'}`,
      ...(data.actions || []).map((a: string) => `- ${a}`),
      `TS: ${new Date(artifact.timestamp).toISOString()}`,
    ];
    return lines.join('\n');
  }

  formatAPRS(event: DisasterEvent, callsign: string): string {
    const data = event.payload.data as { plan?: string };
    const plan = data?.plan || 'UPDATE';
    return `${callsign}>APRS,qAR,localhost:${plan} - Priority: ${event.metadata.priority}`;
  }
}