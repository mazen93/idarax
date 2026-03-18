export declare enum PromotionType {
    BOGO = "BOGO",
    BUY_X_GET_Y_FREE = "BUY_X_GET_Y_FREE",
    BUY_X_GET_Y_PERCENT_OFF = "BUY_X_GET_Y_PERCENT_OFF",
    FIXED_AMOUNT_OFF = "FIXED_AMOUNT_OFF",
    PERCENTAGE_OFF = "PERCENTAGE_OFF",
    FREE_ITEM = "FREE_ITEM",
    TIER_DISCOUNT = "TIER_DISCOUNT",
    STAFF_VOUCHER = "STAFF_VOUCHER"
}
export declare class CreatePromotionDto {
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
    freeItemProductId?: string;
    tierThresholds?: {
        minQty: number;
        pct: number;
    }[];
    happyHourDays?: number[];
    happyHourStart?: string;
    happyHourEnd?: string;
    customerSegment?: string;
    isBirthdayBonus?: boolean;
}
export declare class CreatePromoCodeDto {
    code: string;
    promotionId: string;
    maxUsages?: number;
    maxUsagesPerCustomer?: number;
    firstOrderOnly?: boolean;
    isStackable?: boolean;
    staffOnly?: boolean;
}
export declare class LogRedemptionDto {
    promoCodeId?: string;
    offerCode?: string;
    customerId: string;
    orderId: string;
    discountApplied: number;
}
