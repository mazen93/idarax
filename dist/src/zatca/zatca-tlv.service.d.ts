export declare class ZatcaTlvService {
    encode(tags: (string | Buffer)[]): string;
    getPhase1TLV(sellerName: string, vatNumber: string, timestamp: string, totalWithVat: string, vatAmount: string): string;
}
