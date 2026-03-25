import { RecipeService } from './recipe.service';
export declare class RecipeController {
    private readonly recipeService;
    constructor(recipeService: RecipeService);
    create(dto: {
        parentId: string;
        ingredientId: string;
        quantity: number;
        unit?: string;
    }): Promise<{
        ingredient: {
            name: string;
            costPrice: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        variantId: string | null;
        parentId: string;
        ingredientId: string;
        unit: string;
    }>;
    findByProduct(productId: string): Promise<({
        ingredient: {
            name: string;
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        variantId: string | null;
        parentId: string;
        ingredientId: string;
        unit: string;
    })[]>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        variantId: string | null;
        parentId: string;
        ingredientId: string;
        unit: string;
    }>;
}
