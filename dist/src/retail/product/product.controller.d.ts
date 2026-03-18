import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { UpsertBranchProductDto } from './dto/branch-product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(dto: CreateProductDto): Promise<{
        category: {
            id: string;
            name: string;
        };
        modifiers: ({
            options: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                nameAr: string | null;
                sortOrder: number;
                priceAdjust: import("@prisma/client-runtime-utils").Decimal;
                modifierId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            productId: string;
            required: boolean;
            multiSelect: boolean;
            sortOrder: number;
        })[];
        recipeComponents: ({
            ingredient: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                nameAr: string | null;
                description: string | null;
                descriptionAr: string | null;
                defaultStationId: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                sku: string | null;
                barcode: string | null;
                costPrice: import("@prisma/client-runtime-utils").Decimal;
                isSellable: boolean;
                productType: import("@prisma/client").$Enums.ProductType;
                categoryId: string;
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
        })[];
        variants: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            sku: string | null;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultStationId: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        isSellable: boolean;
        productType: import("@prisma/client").$Enums.ProductType;
        categoryId: string;
    }>;
    findAll(branchId?: string): Promise<any[]>;
    findByBarcode(barcode: string): Promise<({
        modifiers: ({
            options: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                nameAr: string | null;
                sortOrder: number;
                priceAdjust: import("@prisma/client-runtime-utils").Decimal;
                modifierId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            productId: string;
            required: boolean;
            multiSelect: boolean;
            sortOrder: number;
        })[];
        variants: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            sku: string | null;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultStationId: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        isSellable: boolean;
        productType: import("@prisma/client").$Enums.ProductType;
        categoryId: string;
    }) | null>;
    getBranchSettings(branchId: string): Promise<{
        productId: string;
        name: string;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        category: {
            id: string;
            name: string;
        };
        productType: import("@prisma/client").$Enums.ProductType;
        isSellable: boolean;
        isAvailable: any;
        priceOverride: any;
    }[]>;
    upsertBranchSetting(branchId: string, productId: string, dto: UpsertBranchProductDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        productId: string;
        isAvailable: boolean;
        priceOverride: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    resetBranchSetting(branchId: string, productId: string): Promise<import("@prisma/client/runtime/client").GetBatchResult>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
        };
        modifiers: ({
            options: {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                nameAr: string | null;
                sortOrder: number;
                priceAdjust: import("@prisma/client-runtime-utils").Decimal;
                modifierId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            nameAr: string | null;
            productId: string;
            required: boolean;
            multiSelect: boolean;
            sortOrder: number;
        })[];
        recipeComponents: ({
            ingredient: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                nameAr: string | null;
                description: string | null;
                descriptionAr: string | null;
                defaultStationId: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                sku: string | null;
                barcode: string | null;
                costPrice: import("@prisma/client-runtime-utils").Decimal;
                isSellable: boolean;
                productType: import("@prisma/client").$Enums.ProductType;
                categoryId: string;
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
        })[];
        variants: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            sku: string | null;
            costPrice: import("@prisma/client-runtime-utils").Decimal;
            productId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultStationId: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        isSellable: boolean;
        productType: import("@prisma/client").$Enums.ProductType;
        categoryId: string;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<any>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        description: string | null;
        descriptionAr: string | null;
        defaultStationId: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client-runtime-utils").Decimal;
        isSellable: boolean;
        productType: import("@prisma/client").$Enums.ProductType;
        categoryId: string;
    }>;
}
