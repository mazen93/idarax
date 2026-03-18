import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';

@Injectable()
export class RecipeService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async create(dto: { parentId: string; ingredientId: string; quantity: number; unit?: string }) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Verify parent exists and belongs to tenant
        const parent = await this.prisma.product.findUnique({
            where: { id: dto.parentId, tenantId },
        });
        if (!parent) throw new NotFoundException('Parent product not found');

        // Verify ingredient exists and belongs to tenant
        const ingredient = await this.prisma.product.findUnique({
            where: { id: dto.ingredientId, tenantId },
        });
        if (!ingredient) throw new NotFoundException('Ingredient product not found');

        return this.prisma.productRecipe.create({
            data: {
                parentId: dto.parentId,
                ingredientId: dto.ingredientId,
                quantity: dto.quantity,
                unit: dto.unit || 'unit',
            },
            include: {
                ingredient: { select: { name: true, costPrice: true } },
            },
        });
    }

    async findByProduct(productId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.productRecipe.findMany({
            where: {
                parentId: productId,
                parent: { tenantId }
            },
            include: {
                ingredient: { select: { name: true, sku: true, costPrice: true } },
            },
        });
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const recipe = await this.prisma.productRecipe.findUnique({
            where: { id },
            include: { parent: true },
        });

        if (!recipe || recipe.parent.tenantId !== tenantId) {
            throw new NotFoundException('Recipe component not found');
        }

        return this.prisma.productRecipe.delete({ where: { id } });
    }
}
