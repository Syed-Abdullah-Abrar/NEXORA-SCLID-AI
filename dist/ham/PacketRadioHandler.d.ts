export interface DecodedFrame {
    source: string;
    destination: string;
    message: string;
    raw: Uint8Array;
}
export declare class PacketRadioHandler {
    private callsignToBytes;
    encodeAX25(source: string, destination: string, message: string): Uint8Array;
    decodeAX25(frame: Uint8Array): DecodedFrame;
    private bytesToCallsign;
    private calculateCRC;
}
//# sourceMappingURL=PacketRadioHandler.d.ts.map