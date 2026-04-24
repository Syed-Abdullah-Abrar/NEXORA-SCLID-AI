import { DisasterEvent, MemoryArtifact } from '../types';
export declare class HAMBridgeService {
    parseAPRS(raw: string): Promise<DisasterEvent | null>;
    private parseCoordinates;
    voiceToText(transcript: string, callsign: string): Promise<DisasterEvent>;
    broadcast(artifact: MemoryArtifact): Promise<string>;
    formatAPRS(event: DisasterEvent, callsign: string): string;
}
//# sourceMappingURL=HAMBridgeService.d.ts.map