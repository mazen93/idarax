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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let SettingsService = class SettingsService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async get() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
        const globalSettings = await this.prisma.settings.findUnique({
            where: { tenantId },
            include: { tenant: true }
        });
        if (!globalSettings) {
            return this.prisma.settings.create({
                data: { tenantId },
                include: { tenant: true }
            });
        }
        if (branchId) {
            const branchSettings = await this.prisma.client.branchSettings.findUnique({
                where: { branchId }
            });
            if (branchSettings) {
                const merged = { ...globalSettings };
                Object.keys(branchSettings).forEach(key => {
                    if (branchSettings[key] !== null && branchSettings[key] !== undefined && key !== 'id' && key !== 'branchId' && key !== 'tenantId') {
                        merged[key] = branchSettings[key];
                    }
                });
                return merged;
            }
        }
        return globalSettings;
    }
    async update(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
        const { name, ...settingsData } = dto;
        if (settingsData.drovoApiKey || settingsData.drovoTenantId) {
            const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant?.hasDeliveryIntegration) {
                throw new common_1.ForbiddenException('Your subscription plan does not include Delivery Management integrations.');
            }
        }
        if (name && !branchId) {
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { name }
            });
        }
        if (branchId) {
            const branchFields = [
                'taxRate', 'serviceFee', 'receiptHeader', 'receiptFooter', 'receiptLanguage',
                'receiptShowCustomer', 'receiptShowLogo', 'receiptShowOrderNumber', 'receiptShowTable',
                'receiptShowTimestamp', 'receiptShowOrderType', 'receiptShowOperator',
                'receiptShowItemsDescription', 'receiptShowItemsQty', 'receiptShowItemsPrice',
                'receiptShowSubtotal', 'receiptShowTax', 'receiptShowServiceCharge',
                'receiptShowDiscount', 'receiptShowTotal', 'receiptShowPaymentMethod', 'receiptShowBarcode'
            ];
            const branchData = {};
            for (const field of branchFields) {
                if (settingsData[field] !== undefined) {
                    branchData[field] = settingsData[field];
                }
            }
            return this.prisma.client.branchSettings.upsert({
                where: { branchId },
                create: {
                    branchId,
                    tenantId,
                    ...branchData
                },
                update: branchData
            });
        }
        return this.prisma.settings.upsert({
            where: { tenantId },
            create: { tenantId, ...settingsData },
            update: settingsData
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map