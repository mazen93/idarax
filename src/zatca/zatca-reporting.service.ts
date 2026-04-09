import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZatcaXmlService } from './zatca-xml.service';
import { ZatcaCryptoService } from './zatca-crypto.service';
import { ZatcaTlvService } from './zatca-tlv.service';
import axios from 'axios';

@Injectable()
export class ZatcaReportingService {
  private readonly logger = new Logger(ZatcaReportingService.name);

  constructor(
    private prisma: PrismaService,
    private xmlService: ZatcaXmlService,
    private cryptoService: ZatcaCryptoService,
    private tlvService: ZatcaTlvService,
  ) {}

  /**
   * Reports an order to ZATCA.
   * @param orderId UUID of the order.
   */
  async reportOrder(orderId: string): Promise<any> {
    const order = await (this.prisma as any).order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        tenant: { include: { settings: true } },
        branch: true,
      },
    });

    if (!order) throw new Error('Order not found');

    const tenant = order.tenant;
    const settings = tenant.settings;

    if (!settings || !(settings as any).zatcaVatNumber) {
      this.logger.warn(`ZATCA reporting skipped for order ${orderId}: Missing VAT number`);
      return;
    }

    // 1. Generate XML
    const xml = this.xmlService.generateSimplifiedInvoiceXml(order, tenant, settings, order.branch);
    const xmlBase64 = Buffer.from(xml).toString('base64');

    // 2. Generate Hash
    const hash = this.cryptoService.generateHash(xml);

    // 3. Generate Signature (Phase 2 Simulation)
    // For Phase 2, we should use the private key from ZatcaConfig
    const zatcaConfig = await (this.prisma as any).zatcaConfig.findUnique({
      where: { tenantId: tenant.id },
    });

    let signature = 'PHASE_1_SIM_SIG';
    if (zatcaConfig && zatcaConfig.privateKey) {
        signature = this.cryptoService.sign(hash, zatcaConfig.privateKey);
    }

    // 4. Generate QR Code (TLV)
    // Format: [Seller Name][VAT][Timestamp][Total][VAT Amount][Hash][Sig][Key][CertSig]
    const qrTlv = this.tlvService.encode([
      (settings as any).zatcaSellerNameAr || tenant.name,
      (settings as any).zatcaVatNumber,
      order.createdAt.toISOString(),
      Number(order.totalAmount).toFixed(2),
      Number(order.taxAmount).toFixed(2),
      hash,
      signature
    ]);

    // 5. Save Report (Phase 1 / Pending Phase 2)
    const report = await (this.prisma as any).zatcaInvoiceReport.upsert({
      where: { orderId },
      update: {
        status: 'PENDING',
        invoiceHash: hash,
        qrCode: qrTlv,
        xmlBase64,
        reportedAt: new Date(),
      },
      create: {
        orderId,
        status: 'PENDING',
        invoiceHash: hash,
        qrCode: qrTlv,
        xmlBase64,
        reportedAt: new Date(),
      },
    });

    // 6. Submit to ZATCA (Phase 2 Integration)
    if (zatcaConfig && zatcaConfig.binaryToken && (settings as any).zatcaPhase === 2) {
      try {
        const response = await axios.post(
          'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting',
          {
            uuid: order.id,
            invoiceHash: hash,
            invoice: xmlBase64,
          },
          {
            headers: {
              'Accept-Version': 'V2',
              'Authorization': `Basic ${Buffer.from(`${zatcaConfig.binaryToken}:${zatcaConfig.secret}`).toString('base64')}`,
              'Content-Type': 'application/json',
            },
          }
        );

        await (this.prisma as any).zatcaInvoiceReport.update({
          where: { id: report.id },
          data: {
            status: 'REPORTED',
            responsePayload: response.data,
          },
        });

      } catch (err) {
        this.logger.error(`ZATCA submission failed for order ${orderId}: ${err.message}`);
        await (this.prisma as any).zatcaInvoiceReport.update({
          where: { id: report.id },
          data: {
            status: 'FAILED',
            errors: err.response?.data || { message: err.message },
          },
        });
      }
    }

    return report;
  }
}
