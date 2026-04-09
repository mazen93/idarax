export declare class ZatcaCryptoService {
    generateHash(content: string): string;
    sign(hash: string, privateKey: string): string;
    generateKeyPair(): {
        publicKey: string;
        privateKey: string;
    };
    generateCsr(privateKey: string, commonName: string, organizationName: string, organizationUnit: string, country: string, vatNumber: string): string;
}
