import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
export declare class RecipeService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: {
        parentId: string;
        ingredientId: string;
        quantity: number;
        unit?: string;
    }): Promise<{
        ingredient: {
            name: string;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client-runtime-utils").Decimal;
        variantId: string | null;
        parentId: string;
        ingredientId: string;
        unit: string;
    }>;
    findByProduct(productId: string): Promise<({
        ingredient: {
            name: string;
            sku: string | null;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client-runtime-utils").Decimal;
        variantId: string | null;
        parentId: string;
        ingredientId: string;
        unit: string;
    })[]>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client-runtime-utils").Decimal;
        variantId: string | null;
        parentId: string;
        ingredientId: string;
        unit: string;
    }>;
}
