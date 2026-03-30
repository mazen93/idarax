import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantService: TenantService
    ) { }

    async create(dto: CreateCategoryDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Sanitize: convert empty strings to null for optional IDs
        const data = {
            ...dto,
            tenantId,
            defaultStationId: dto.defaultStationId || null,
        };

        return this.prisma.category.create({ data });
    }

    async findAll(menuId?: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.category.findMany({
            where: {
                tenantId,
                ...(menuId ? { menus: { some: { menuId } } } : {})
            },
            include: {
                _count: { select: { products: true } },
                menus: { select: { menuId: true } }
            }
        });
    }

    async update(id: string, dto: UpdateCategoryDto) {
        const tenantId = this.tenantService.getTenantId();
        
        // Sanitize: convert empty strings to null for optional IDs
        const data = { ...dto };
        if (dto.defaultStationId === '') {
            data.defaultStationId = null as any;
        }

        return this.prisma.category.update({
            where: { id, tenantId },
            data
        });
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.category.delete({
            where: { id, tenantId }
        });
    }
}
