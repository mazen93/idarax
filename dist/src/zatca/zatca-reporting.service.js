"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ZatcaReportingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZatcaReportingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const zatca_xml_service_1 = require("./zatca-xml.service");
const zatca_crypto_service_1 = require("./zatca-crypto.service");
const zatca_tlv_service_1 = require("./zatca-tlv.service");
const axios_1 = __importDefault(require("axios"));
let ZatcaReportingService = ZatcaReportingService_1 = class ZatcaReportingService {
    prisma;
    xmlService;
    cryptoService;
    tlvService;
    logger = new common_1.Logger(ZatcaReportingService_1.name);
    constructor(prisma, xmlService, cryptoService, tlvService) {
        this.prisma = prisma;
        this.xmlService = xmlService;
        this.cryptoService = cryptoService;
        this.tlvService = tlvService;
    }
    async reportOrder(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                tenant: { include: { settings: true } },
                branch: true,
            },
        });
        if (!order)
            throw new Error('Order not found');
        const tenant = order.tenant;
        const settings = tenant.settings;
        if (!settings || !settings.zatcaVatNumber) {
            this.logger.warn(`ZATCA reporting skipped for order ${orderId}: Missing VAT number`);
            return;
        }
        const xml = this.xmlService.generateSimplifiedInvoiceXml(order, tenant, settings, order.branch);
        const xmlBase64 = Buffer.from(xml).toString('base64');
        const hash = this.cryptoService.generateHash(xml);
        const zatcaConfig = await this.prisma.zatcaConfig.findUnique({
            where: { tenantId: tenant.id },
        });
        let signature = 'PHASE_1_SIM_SIG';
        if (zatcaConfig && zatcaConfig.privateKey) {
            signature = this.cryptoService.sign(hash, zatcaConfig.privateKey);
        }
        const qrTlv = this.tlvService.encode([
            settings.zatcaSellerNameAr || tenant.name,
            settings.zatcaVatNumber,
            order.createdAt.toISOString(),
            Number(order.totalAmount).toFixed(2),
            Number(order.taxAmount).toFixed(2),
            hash,
            signature
        ]);
        const report = await this.prisma.zatcaInvoiceReport.upsert({
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
        if (zatcaConfig && zatcaConfig.binaryToken && settings.zatcaPhase === 2) {
            try {
                const response = await axios_1.default.post('https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting', {
                    uuid: order.id,
                    invoiceHash: hash,
                    invoice: xmlBase64,
                }, {
                    headers: {
                        'Accept-Version': 'V2',
                        'Authorization': `Basic ${Buffer.from(`${zatcaConfig.binaryToken}:${zatcaConfig.secret}`).toString('base64')}`,
                        'Content-Type': 'application/json',
                    },
                });
                await this.prisma.zatcaInvoiceReport.update({
                    where: { id: report.id },
                    data: {
                        status: 'REPORTED',
                        responsePayload: response.data,
                    },
                });
            }
            catch (err) {
                this.logger.error(`ZATCA submission failed for order ${orderId}: ${err.message}`);
                await this.prisma.zatcaInvoiceReport.update({
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
};
exports.ZatcaReportingService = ZatcaReportingService;
exports.ZatcaReportingService = ZatcaReportingService = ZatcaReportingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zatca_xml_service_1.ZatcaXmlService,
        zatca_crypto_service_1.ZatcaCryptoService,
        zatca_tlv_service_1.ZatcaTlvService])
], ZatcaReportingService);
//# sourceMappingURL=zatca-reporting.service.js.map