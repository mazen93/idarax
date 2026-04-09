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

        let settings: any = globalSettings;

        if (!settings) {
            // Create default settings if they don't exist
            settings = await this.prisma.settings.create({
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
                const merged = { ...settings };
                Object.keys(branchSettings).forEach(key => {
                    if (branchSettings[key] !== null && branchSettings[key] !== undefined && key !== 'id' && key !== 'branchId' && key !== 'tenantId') {
                        (merged as any)[key] = branchSettings[key];
                    }
                });
                settings = merged;
            }
        }

        // Strip sensitive fields
        if (settings) {
            delete settings.drovoApiKey;
            delete settings.drovoTenantId;
        }

        return settings;
    }

    async update(dto: UpdateSettingsDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const branchId = this.tenantService.getBranchId();
        const { name, slug, customDomain, ...settingsData } = dto;

        if (settingsData.drovoApiKey || settingsData.drovoTenantId) {
            const tenant = await (this.prisma.tenant as any).findUnique({ where: { id: tenantId } });
            if (!tenant?.hasDeliveryIntegration) {
                throw new ForbiddenException('Your subscription plan does not include Delivery Management integrations.');
            }
        }

        if ((name || slug || customDomain) && !branchId) {
            await (this.prisma.tenant as any).update({
                where: { id: tenantId },
                data: { 
                    name: name || undefined,
                    slug: slug || undefined,
                    customDomain: customDomain || undefined
                }
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
                'receiptShowDiscount', 'receiptShowTotal', 'receiptShowPaymentMethod', 'receiptShowBarcode',
                'preOrderEnabled', 'preOrderMaxDaysAhead', 'preOrderLeadMinutes',
                'requireOpenShift', 'requireOpenDrawer'
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
