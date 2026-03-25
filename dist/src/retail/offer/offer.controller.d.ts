import { OfferService } from './offer.service';
import { CreatePromotionDto, CreatePromoCodeDto, LogRedemptionDto } from './dto/promotion.dto';
export declare class OfferController {
    private readonly offerService;
    constructor(offerService: OfferService);
    createPromotion(dto: CreatePromotionDto): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import(".prisma/client").$Enums.PromotionType;
        updatedAt: Date;
        description: string | null;
        applicableProductIds: string[];
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        buyQuantity: number | null;
        getQuantity: number | null;
        discountValue: import("@prisma/client/runtime/library").Decimal | null;
        customerSegment: string | null;
        freeItemProductId: string | null;
        happyHourDays: number[];
        happyHourEnd: string | null;
        happyHourStart: string | null;
        isBirthdayBonus: boolean;
        tierThresholds: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAllPromotions(): Promise<({
        promoCodes: {
            id: string;
            tenantId: string;
            createdAt: Date;
            code: string;
            promotionId: string;
            maxUsages: number | null;
            usedCount: number;
            firstOrderOnly: boolean;
            isStackable: boolean;
            maxUsagesPerCustomer: number | null;
            staffOnly: boolean;
        }[];
    } & {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import(".prisma/client").$Enums.PromotionType;
        updatedAt: Date;
        description: string | null;
        applicableProductIds: string[];
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        buyQuantity: number | null;
        getQuantity: number | null;
        discountValue: import("@prisma/client/runtime/library").Decimal | null;
        customerSegment: string | null;
        freeItemProductId: string | null;
        happyHourDays: number[];
        happyHourEnd: string | null;
        happyHourStart: string | null;
        isBirthdayBonus: boolean;
        tierThresholds: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    updatePromotion(id: string, dto: Partial<CreatePromotionDto>): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import(".prisma/client").$Enums.PromotionType;
        updatedAt: Date;
        description: string | null;
        applicableProductIds: string[];
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        buyQuantity: number | null;
        getQuantity: number | null;
        discountValue: import("@prisma/client/runtime/library").Decimal | null;
        customerSegment: string | null;
        freeItemProductId: string | null;
        happyHourDays: number[];
        happyHourEnd: string | null;
        happyHourStart: string | null;
        isBirthdayBonus: boolean;
        tierThresholds: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deletePromotion(id: string): Promise<[import(".prisma/client").Prisma.BatchPayload, {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        type: import(".prisma/client").$Enums.PromotionType;
        updatedAt: Date;
        description: string | null;
        applicableProductIds: string[];
        maxDiscountAmount: import("@prisma/client/runtime/library").Decimal | null;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        validFrom: Date | null;
        validUntil: Date | null;
        buyQuantity: number | null;
        getQuantity: number | null;
        discountValue: import("@prisma/client/runtime/library").Decimal | null;
        customerSegment: string | null;
        freeItemProductId: string | null;
        happyHourDays: number[];
        happyHourEnd: string | null;
        happyHourStart: string | null;
        isBirthdayBonus: boolean;
        tierThresholds: import("@prisma/client/runtime/library").JsonValue | null;
    }]>;
    createPromoCode(dto: CreatePromoCodeDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        code: string;
        promotionId: string;
        maxUsages: number | null;
        usedCount: number;
        firstOrderOnly: boolean;
        isStackable: boolean;
        maxUsagesPerCustomer: number | null;
        staffOnly: boolean;
    }>;
    updatePromoCode(id: string, dto: Partial<CreatePromoCodeDto>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        code: string;
        promotionId: string;
        maxUsages: number | null;
        usedCount: number;
        firstOrderOnly: boolean;
        isStackable: boolean;
        maxUsagesPerCustomer: number | null;
        staffOnly: boolean;
    }>;
    deletePromoCode(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        code: string;
        promotionId: string;
        maxUsages: number | null;
        usedCount: number;
        firstOrderOnly: boolean;
        isStackable: boolean;
        maxUsagesPerCustomer: number | null;
        staffOnly: boolean;
    }>;
    validatePromotion(dto: {
        code: string;
        items: {
            productId: string;
            quantity: number;
            price: number;
        }[];
        customerId?: string;
    }): Promise<{
        isValid: boolean;
        discountAmount: number;
        message?: string;
        freeItemProductId?: string;
    }>;
    logRedemption(dto: LogRedemptionDto): Promise<any>;
    getAutoPromotions(dto: {
        items: {
            productId: string;
            quantity: number;
            price: number;
        }[];
        customerId?: string;
    }): Promise<{
        id: any;
        name: any;
        type: any;
        discountValue: any;
        description: any;
    }[]>;
    getPromoAnalytics(): Promise<{
        id: string;
        code: string;
        promotionName: string;
        promotionType: import(".prisma/client").$Enums.PromotionType;
        maxUsages: number | null;
        usedCount: number;
        totalRevenueGenerated: number;
        status: string;
    }[]>;
}
export declare class SeedOfferController {
    private readonly offerService;
    constructor(offerService: OfferService);
    seedPromotions(): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
        stack?: undefined;
    } | {
        success: boolean;
        error: any;
        stack: any;
        message?: undefined;
    }>;
}
