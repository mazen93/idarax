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

        const settings = await this.prisma.settings.findUnique({
            where: { tenantId },
            include: { tenant: true }
        });

        if (!settings) {
            // Create default settings if they don't exist
            return this.prisma.settings.create({
                data: { tenantId },
                include: { tenant: true }
            });
        }

        return settings;
    }

    async update(dto: UpdateSettingsDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const { name, ...settingsData } = dto;

        if (name) {
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { name }
            });
        }

        return this.prisma.settings.upsert({
            where: { tenantId },
            create: { tenantId, ...settingsData },
            update: settingsData
        });
    }
}
