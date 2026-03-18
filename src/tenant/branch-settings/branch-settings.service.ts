import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { UpdateBranchSettingsDto } from './dto/branch-settings.dto';

@Injectable()
export class BranchSettingsService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) {}

    async getByBranch(branchId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Ensure branch belongs to tenant
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.tenantId !== tenantId) {
            throw new NotFoundException('Branch not found');
        }

        const settings = await (this.prisma.client as any).branchSettings.findUnique({
            where: { branchId },
        });

        // If none exist yet, return an empty initialized object
        return settings || { branchId, tenantId, isActive: false };
    }

    async upsert(branchId: string, dto: UpdateBranchSettingsDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Ensure branch belongs to tenant
        const branch = await this.prisma.client.branch.findUnique({ where: { id: branchId } });
        if (!branch || branch.tenantId !== tenantId) {
            throw new NotFoundException('Branch not found');
        }

        const data: any = { ...dto };
        
        return (this.prisma.client as any).branchSettings.upsert({
            where: { branchId },
            create: {
                branchId,
                tenantId,
                ...data
            },
            update: data
        });
    }
}
