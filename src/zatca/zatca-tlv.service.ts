import { Injectable } from '@nestjs/common';

@Injectable()
export class ZatcaTlvService {
  /**
   * Encodes a list of tags into a TLV-encoded Base64 string.
   * @param tags Array of tag values as strings or Buffers.
   */
  encode(tags: (string | Buffer)[]): string {
    const buffers: Buffer[] = [];
    
    tags.forEach((value, index) => {
      const tagId = index + 1;
      const valueBuffer = Buffer.isBuffer(value) ? value : Buffer.from(value.toString(), 'utf8');
      
      // Tag ID (1 byte)
      const tagIdBuffer = Buffer.alloc(1);
      tagIdBuffer.writeUInt8(tagId, 0);
      
      // Length (1 byte)
      const lengthBuffer = Buffer.alloc(1);
      lengthBuffer.writeUInt8(valueBuffer.length, 0);
      
      buffers.push(tagIdBuffer, lengthBuffer, valueBuffer);
    });
    
    return Buffer.concat(buffers).toString('base64');
  }

  /**
   * Helper for Phase 1 QR generation
   */
  getPhase1TLV(
    sellerName: string,
    vatNumber: string,
    timestamp: string,
    totalWithVat: string,
    vatAmount: string
  ): string {
    return this.encode([
      sellerName,
      vatNumber,
      timestamp,
      totalWithVat,
      vatAmount
    ]);
  }
}
