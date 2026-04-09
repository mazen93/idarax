import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZatcaCryptoService } from './zatca-crypto.service';
import axios from 'axios';

@Injectable()
export class ZatcaOnboardingService {
  private readonly logger = new Logger(ZatcaOnboardingService.name);

  constructor(
    private prisma: PrismaService,
    private cryptoService: ZatcaCryptoService,
  ) {}

  /**
   * Onboards a new EGS device for a tenant.
   * 1. Generates Key Pair
   * 2. Generates CSR
   * 3. (In real system) Hits ZATCA CSID API
   */
  async onboardDevice(tenantId: string, branchId?: string): Promise<any> {
    const settings = await (this.prisma as any).settings.findUnique({
      where: { tenantId },
    });

    if (!settings || !(settings as any).zatcaVatNumber) {
      throw new Error('VAT Number is required for ZATCA onboarding');
    }

    // 1. Generate Key Pair
    const { publicKey, privateKey } = this.cryptoService.generateKeyPair();

    // 2. Generate CSR (Placeholder - requires node-forge or similar)
    const csr = this.cryptoService.generateCsr(
      privateKey,
      (settings as any).zatcaSellerNameEn || 'Idarax Merchant',
      (settings as any).zatcaSellerNameEn || 'Idarax',
      branchId || 'Main',
      'SA',
      (settings as any).zatcaVatNumber
    );

    // 3. Save Configuration
    const config = await (this.prisma as any).zatcaConfig.upsert({
      where: { tenantId },
      update: {
        branchId,
        privateKey,
        publicKey,
        csr,
      },
      create: {
        tenantId,
        branchId,
        privateKey,
        publicKey,
        csr,
        environment: 'SANDBOX',
      },
    });

    // 4. Update Settings
    await (this.prisma as any).settings.update({
        where: { tenantId },
        data: {
            zatcaIsOnboarded: true,
            zatcaEgsUuid: crypto.randomUUID(), // Simplified for demo
        }
    });

    return config;
  }

  /**
   * Completes onboarding by exchanging an OTP for a CSID.
   */
  async completeOnboarding(tenantId: string, otp: string): Promise<any> {
      const config = await (this.prisma as any).zatcaConfig.findUnique({
          where: { tenantId }
      });

      if (!config || !config.csr) throw new Error('CSR not found for this tenant');

      try {
          // ZATCA Onboarding API call (Sandbox)
          const response = await axios.post(
              'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance',
              { csr: config.csr },
              {
                  headers: {
                      'OTP': otp,
                      'Accept-Version': 'V2',
                      'Content-Type': 'application/json'
                  }
              }
          );

          // Save the Binary Token (CSID) and Secret
          await (this.prisma as any).zatcaConfig.update({
              where: { id: config.id },
              data: {
                  binaryToken: response.data.binarySecurityToken,
                  secret: response.data.secret,
              }
          });

          return response.data;
      } catch (err) {
          this.logger.error(`ZATCA onboarding completion failed: ${err.message}`);
          throw err;
      }
  }
}
