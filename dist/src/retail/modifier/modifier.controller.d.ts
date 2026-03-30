import { ModifierService } from './modifier.service';
export declare class ModifierController {
    private readonly modifierService;
    constructor(modifierService: ModifierService);
    getAll(productId: string): Promise<({
        options: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            sortOrder: number;
            priceAdjust: import("@prisma/client/runtime/library").Decimal;
            modifierId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            sortOrder: number;
            priceAdjust: import("@prisma/client/runtime/library").Decimal;
            modifierId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        productId: string;
        required: boolean;
        multiSelect: boolean;
        sortOrder: number;
    }>;
    updateGroup(groupId: string, dto: {
        name?: string;
        required?: boolean;
        multiSelect?: boolean;
        sortOrder?: number;
    }): Promise<{
        options: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            nameAr: string | null;
            sortOrder: number;
            priceAdjust: import("@prisma/client/runtime/library").Decimal;
            modifierId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        productId: string;
        required: boolean;
        multiSelect: boolean;
        sortOrder: number;
    }>;
    deleteGroup(groupId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        productId: string;
        required: boolean;
        multiSelect: boolean;
        sortOrder: number;
    }>;
    addOption(groupId: string, dto: {
        name: string;
        priceAdjust?: number;
        sortOrder?: number;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        sortOrder: number;
        priceAdjust: import("@prisma/client/runtime/library").Decimal;
        modifierId: string;
    }>;
    updateOption(optionId: string, dto: {
        name?: string;
        priceAdjust?: number;
        sortOrder?: number;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        sortOrder: number;
        priceAdjust: import("@prisma/client/runtime/library").Decimal;
        modifierId: string;
    }>;
    deleteOption(optionId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        nameAr: string | null;
        sortOrder: number;
        priceAdjust: import("@prisma/client/runtime/library").Decimal;
        modifierId: string;
    }>;
}
