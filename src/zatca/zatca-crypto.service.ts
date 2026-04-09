import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ZatcaCryptoService {
  /**
   * Generates a SHA-256 hash of the provided string.
   * Note: For ZATCA, the XML should be canonicalized (C14N) before hashing.
   */
  generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('base64');
  }

  /**
   * Signs the hash using the provided private key (ECDSA secp256r1).
   */
  sign(hash: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    // ZATCA requires DER encoding for the signature, which is default in Node.js crypto
    return sign.sign(privateKey, 'base64');
  }

  /**
   * Generates a new ECDSA key pair (secp256r1/P-256) for a new EGS device.
   */
  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256r1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  /**
   * Generates a Certificate Signing Request (CSR) for ZATCA onboarding.
   * This is a simplified version; real CSR generation might need 'node-forge' or 'openssl'.
   */
  generateCsr(
    privateKey: string,
    commonName: string,
    organizationName: string,
    organizationUnit: string,
    country: string,
    vatNumber: string
  ): string {
     // In a real implementation, we would use node-forge to generate the PKCS#10 CSR
     // including the specific ZATCA extensions.
     return 'CSR_PLACEHOLDER';
  }
}
