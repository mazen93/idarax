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
var ZatcaOnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZatcaOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const zatca_crypto_service_1 = require("./zatca-crypto.service");
const axios_1 = __importDefault(require("axios"));
let ZatcaOnboardingService = ZatcaOnboardingService_1 = class ZatcaOnboardingService {
    prisma;
    cryptoService;
    logger = new common_1.Logger(ZatcaOnboardingService_1.name);
    constructor(prisma, cryptoService) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
    }
    async onboardDevice(tenantId, branchId) {
        const settings = await this.prisma.settings.findUnique({
            where: { tenantId },
        });
        if (!settings || !settings.zatcaVatNumber) {
            throw new Error('VAT Number is required for ZATCA onboarding');
        }
        const { publicKey, privateKey } = this.cryptoService.generateKeyPair();
        const csr = this.cryptoService.generateCsr(privateKey, settings.zatcaSellerNameEn || 'Idarax Merchant', settings.zatcaSellerNameEn || 'Idarax', branchId || 'Main', 'SA', settings.zatcaVatNumber);
        const config = await this.prisma.zatcaConfig.upsert({
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
        await this.prisma.settings.update({
            where: { tenantId },
            data: {
                zatcaIsOnboarded: true,
                zatcaEgsUuid: crypto.randomUUID(),
            }
        });
        return config;
    }
    async completeOnboarding(tenantId, otp) {
        const config = await this.prisma.zatcaConfig.findUnique({
            where: { tenantId }
        });
        if (!config || !config.csr)
            throw new Error('CSR not found for this tenant');
        try {
            const response = await axios_1.default.post('https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance', { csr: config.csr }, {
                headers: {
                    'OTP': otp,
                    'Accept-Version': 'V2',
                    'Content-Type': 'application/json'
                }
            });
            await this.prisma.zatcaConfig.update({
                where: { id: config.id },
                data: {
                    binaryToken: response.data.binarySecurityToken,
                    secret: response.data.secret,
                }
            });
            return response.data;
        }
        catch (err) {
            this.logger.error(`ZATCA onboarding completion failed: ${err.message}`);
            throw err;
        }
    }
};
exports.ZatcaOnboardingService = ZatcaOnboardingService;
exports.ZatcaOnboardingService = ZatcaOnboardingService = ZatcaOnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zatca_crypto_service_1.ZatcaCryptoService])
], ZatcaOnboardingService);
//# sourceMappingURL=zatca-onboarding.service.js.map