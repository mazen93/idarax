import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
export declare class ModifierService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    getForProduct(productId: string): Promise<({
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
    })[]>;
    createGroup(productId: string, dto: {
        name: string;
        required?: boolean;
        multiSelect?: boolean;
        sortOrder?: number;
    }): Promise<{
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
    }>;
    updateGroup(modifierId: string, dto: {
        name?: string;
        required?: boolean;
        multiSelect?: boolean;
        sortOrder?: number;
    }): Promise<{
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
    }>;
    deleteGroup(modifierId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        productId: string;
        required: boolean;
        multiSelect: boolean;
        sortOrder: number;
    }>;
    addOption(modifierId: string, dto: {
        name: string;
        priceAdjust?: number;
        sortOrder?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        sortOrder: number;
        priceAdjust: import("@prisma/client-runtime-utils").Decimal;
        modifierId: string;
    }>;
    updateOption(optionId: string, dto: {
        name?: string;
        priceAdjust?: number;
        sortOrder?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        sortOrder: number;
        priceAdjust: import("@prisma/client-runtime-utils").Decimal;
        modifierId: string;
    }>;
    deleteOption(optionId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nameAr: string | null;
        sortOrder: number;
        priceAdjust: import("@prisma/client-runtime-utils").Decimal;
        modifierId: string;
    }>;
}
