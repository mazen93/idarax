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
                priceAdjust: import("@prisma/client/runtime/library").Decimal;
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
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string | null;
                barcode: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                isSellable: boolean;
                productType: import(".prisma/client").$Enums.ProductType;
                prepTime: number;
                unit: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unit: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            variantId: string | null;
            parentId: string;
            ingredientId: string;
        })[];
        variants: {
            id: string;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal | null;
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        price: import("@prisma/client/runtime/library").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        isSellable: boolean;
        productType: import(".prisma/client").$Enums.ProductType;
        prepTime: number;
        unit: string | null;
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
                priceAdjust: import("@prisma/client/runtime/library").Decimal;
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
            price: import("@prisma/client/runtime/library").Decimal | null;
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        price: import("@prisma/client/runtime/library").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        isSellable: boolean;
        productType: import(".prisma/client").$Enums.ProductType;
        prepTime: number;
        unit: string | null;
        categoryId: string;
    }) | null>;
    getBranchSettings(branchId: string): Promise<{
        productId: any;
        name: any;
        basePrice: any;
        category: any;
        productType: any;
        isSellable: any;
        isAvailable: any;
        priceOverride: any;
        defaultStationId: any;
    }[]>;
    upsertBranchSetting(branchId: string, productId: string, dto: UpsertBranchProductDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string;
        defaultStationId: string | null;
        productId: string;
        isAvailable: boolean;
        priceOverride: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    resetBranchSetting(branchId: string, productId: string): Promise<import("@prisma/client/runtime/library").GetBatchResult>;
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
                priceAdjust: import("@prisma/client/runtime/library").Decimal;
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
                price: import("@prisma/client/runtime/library").Decimal;
                sku: string | null;
                barcode: string | null;
                costPrice: import("@prisma/client/runtime/library").Decimal;
                isSellable: boolean;
                productType: import(".prisma/client").$Enums.ProductType;
                prepTime: number;
                unit: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            unit: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            variantId: string | null;
            parentId: string;
            ingredientId: string;
        })[];
        variants: {
            id: string;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal | null;
            sku: string | null;
            costPrice: import("@prisma/client/runtime/library").Decimal;
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
        price: import("@prisma/client/runtime/library").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        isSellable: boolean;
        productType: import(".prisma/client").$Enums.ProductType;
        prepTime: number;
        unit: string | null;
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
        price: import("@prisma/client/runtime/library").Decimal;
        sku: string | null;
        barcode: string | null;
        costPrice: import("@prisma/client/runtime/library").Decimal;
        isSellable: boolean;
        productType: import(".prisma/client").$Enums.ProductType;
        prepTime: number;
        unit: string | null;
        categoryId: string;
    }>;
}
