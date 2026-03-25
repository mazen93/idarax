import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async get() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const branchId = this.tenantService.getBranchId();

        const globalSettings = await this.prisma.settings.findUnique({
            where: { tenantId },
            include: { tenant: true }
        });

        if (!globalSettings) {
            // Create default settings if they don't exist
            return this.prisma.settings.create({
                data: { tenantId },
                include: { tenant: true }
            });
        }

        if (branchId) {
            const branchSettings = await (this.prisma.client as any).branchSettings.findUnique({
                where: { branchId }
            });

            if (branchSettings) {
                // Merge branch overrides into global settings
                const merged = { ...globalSettings };
                Object.keys(branchSettings).forEach(key => {
                    if (branchSettings[key] !== null && branchSettings[key] !== undefined && key !== 'id' && key !== 'branchId' && key !== 'tenantId') {
                        (merged as any)[key] = branchSettings[key];
                    }
                });
                return merged;
            }
        }

        return globalSettings;
    }

    async update(dto: UpdateSettingsDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const branchId = this.tenantService.getBranchId();
        const { name, ...settingsData } = dto;

        if (settingsData.drovoApiKey || settingsData.drovoTenantId) {
            const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
            if (!tenant?.hasDeliveryIntegration) {
                throw new ForbiddenException('Your subscription plan does not include Delivery Management integrations.');
            }
        }

        if (name && !branchId) {
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { name }
            });
        }

        if (branchId) {
            // Only update fields that exist in BranchSettings
            const branchFields = [
                'taxRate', 'serviceFee', 'receiptHeader', 'receiptFooter', 'receiptLanguage',
                'receiptShowCustomer', 'receiptShowLogo', 'receiptShowOrderNumber', 'receiptShowTable',
                'receiptShowTimestamp', 'receiptShowOrderType', 'receiptShowOperator',
                'receiptShowItemsDescription', 'receiptShowItemsQty', 'receiptShowItemsPrice',
                'receiptShowSubtotal', 'receiptShowTax', 'receiptShowServiceCharge',
                'receiptShowDiscount', 'receiptShowTotal', 'receiptShowPaymentMethod', 'receiptShowBarcode'
            ];

            const branchData: any = {};
            for (const field of branchFields) {
                if ((settingsData as any)[field] !== undefined) {
                    branchData[field] = (settingsData as any)[field];
                }
            }

            return (this.prisma.client as any).branchSettings.upsert({
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
}
