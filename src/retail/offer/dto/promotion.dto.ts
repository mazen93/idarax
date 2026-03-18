export enum PromotionType {
    BOGO = 'BOGO',
    BUY_X_GET_Y_FREE = 'BUY_X_GET_Y_FREE',
    BUY_X_GET_Y_PERCENT_OFF = 'BUY_X_GET_Y_PERCENT_OFF',
    FIXED_AMOUNT_OFF = 'FIXED_AMOUNT_OFF',
    PERCENTAGE_OFF = 'PERCENTAGE_OFF',
    // Phase 2
    FREE_ITEM = 'FREE_ITEM',
    TIER_DISCOUNT = 'TIER_DISCOUNT',
    STAFF_VOUCHER = 'STAFF_VOUCHER',
}

export class CreatePromotionDto {
    name: string;
    description?: string;
    type: PromotionType;
    buyQuantity?: number;
    getQuantity?: number;
    discountValue?: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    isActive?: boolean;
    validFrom?: Date;
    validUntil?: Date;
    applicableProductIds?: string[];
    // Phase 2
    freeItemProductId?: string;
    tierThresholds?: { minQty: number; pct: number }[];
    // Phase 3
    happyHourDays?: number[];   // [1,2,3,4,5] = Mon–Fri
    happyHourStart?: string;    // "15:00"
    happyHourEnd?: string;      // "18:00"
    customerSegment?: string;   // "ALL" | "VIP" | "NEW" | "RETURNING"
    isBirthdayBonus?: boolean;
}

export class CreatePromoCodeDto {
    code: string;
    promotionId: string;
    maxUsages?: number;
    // Phase 1
    maxUsagesPerCustomer?: number;
    firstOrderOnly?: boolean;
    isStackable?: boolean;
    staffOnly?: boolean;
}

// Phase 1: Redemption log DTO
export class LogRedemptionDto {
    promoCodeId?: string;   // Optional — if not provided, offerCode will be used to look up
    offerCode?: string;     // The code string, used as fallback lookup
    customerId: string;
    orderId: string;
    discountApplied: number;
}
