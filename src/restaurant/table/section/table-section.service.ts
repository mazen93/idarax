import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantService } from '../../../tenant/tenant.service';
import { CreateTableSectionDto, UpdateTableSectionDto } from './dto/table-section.dto';

@Injectable()
export class TableSectionService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async create(dto: CreateTableSectionDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).tableSection.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        return (this.prisma.client as any).tableSection.findMany({
            where: { tenantId },
            include: {
                tables: true,
            },
        });
    }

    async findOne(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const section = await (this.prisma.client as any).tableSection.findUnique({
            where: { id },
            include: { tables: true }
        });

        if (!section || section.tenantId !== tenantId) {
            throw new ForbiddenException('Section not found or access denied');
        }

        return section;
    }

    async update(id: string, dto: UpdateTableSectionDto) {
        await this.findOne(id);
        return (this.prisma.client as any).tableSection.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return (this.prisma.client as any).tableSection.delete({
            where: { id },
        });
    }
}
