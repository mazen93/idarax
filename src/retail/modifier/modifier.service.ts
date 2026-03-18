import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';

@Injectable()
export class ModifierService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    /** Get all modifiers (groups + options) for a product */
    async getForProduct(productId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.client.productModifier.findMany({
            where: { productId },
            include: { options: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { sortOrder: 'asc' },
        });
    }

    /** Create a modifier group on a product */
    async createGroup(productId: string, dto: { name: string; required?: boolean; multiSelect?: boolean; sortOrder?: number }) {
        return this.prisma.client.productModifier.create({
            data: {
                productId,
                name: dto.name,
                required: dto.required ?? false,
                multiSelect: dto.multiSelect ?? false,
                sortOrder: dto.sortOrder ?? 0,
            },
            include: { options: true },
        });
    }

    /** Update a modifier group */
    async updateGroup(modifierId: string, dto: { name?: string; required?: boolean; multiSelect?: boolean; sortOrder?: number }) {
        return this.prisma.client.productModifier.update({
            where: { id: modifierId },
            data: dto,
            include: { options: { orderBy: { sortOrder: 'asc' } } },
        });
    }

    /** Delete a modifier group and all its options */
    async deleteGroup(modifierId: string) {
        return this.prisma.client.productModifier.delete({ where: { id: modifierId } });
    }

    /** Add an option to an existing modifier group */
    async addOption(modifierId: string, dto: { name: string; priceAdjust?: number; sortOrder?: number }) {
        return this.prisma.client.productModifierOption.create({
            data: {
                modifierId,
                name: dto.name,
                priceAdjust: dto.priceAdjust ?? 0,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }

    /** Update an option */
    async updateOption(optionId: string, dto: { name?: string; priceAdjust?: number; sortOrder?: number }) {
        return this.prisma.client.productModifierOption.update({
            where: { id: optionId },
            data: dto,
        });
    }

    /** Delete an option */
    async deleteOption(optionId: string) {
        return this.prisma.client.productModifierOption.delete({ where: { id: optionId } });
    }
}
