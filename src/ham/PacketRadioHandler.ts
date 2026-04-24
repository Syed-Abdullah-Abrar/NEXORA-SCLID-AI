export interface DecodedFrame {
  source: string;
  destination: string;
  message: string;
  raw: Uint8Array;
}

export class PacketRadioHandler {
  private callsignToBytes(callsign: string): Uint8Array {
    const bytes = new Uint8Array(6);
    const padded = callsign.padEnd(6, ' ').toUpperCase();
    for (let i = 0; i < 6; i++) {
      bytes[i] = padded.charCodeAt(i) << 1;
    }
    bytes[6] = 0x60; // SSID suffix
    return bytes;
  }

  encodeAX25(source: string, destination: string, message: string): Uint8Array {
    const srcBytes = this.callsignToBytes(source);
    const dstBytes = this.callsignToBytes(destination);

    const msgBytes = new TextEncoder().encode(message);
    const totalLength = 16 + msgBytes.length + 2;
    const frame = new Uint8Array(totalLength);

    dstBytes.forEach((b, i) => frame[i] = b);
    srcBytes.forEach((b, i) => frame[7 + i] = b);

    frame[14] = 0x03; // Control: UI frame
    frame[15] = 0xF0; // Protocol ID: No layer 3

    msgBytes.forEach((b, i) => frame[16 + i] = b);

    const crc = this.calculateCRC(frame.slice(0, 16 + msgBytes.length));
    frame[frame.length - 2] = crc & 0xFF;
    frame[frame.length - 1] = (crc >> 8) & 0xFF;

    return frame;
  }

  decodeAX25(frame: Uint8Array): DecodedFrame {
    const dstCallsign = this.bytesToCallsign(frame.slice(0, 7));
    const srcCallsign = this.bytesToCallsign(frame.slice(7, 14));

    const msgStart = 16;
    const msgEnd = frame.length - 2;
    const message = new TextDecoder().decode(frame.slice(msgStart, msgEnd));

    return {
      source: srcCallsign.trim(),
      destination: dstCallsign.trim(),
      message: message.trim(),
      raw: frame,
    };
  }

  private bytesToCallsign(bytes: Uint8Array): string {
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += String.fromCharCode(bytes[i] >> 1);
    }
    const ssid = bytes[6] >> 1;
    if (ssid !== 0) result += `-${ssid}`;
    return result;
  }

  private calculateCRC(data: Uint8Array): number {
    let crc = 0xFFFF;
    for (const byte of data) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) {
        crc = (crc >> 1) ^ (0xA001 & -(crc & 1));
      }
    }
    return crc;
  }
}