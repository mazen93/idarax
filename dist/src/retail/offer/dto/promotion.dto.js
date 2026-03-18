"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogRedemptionDto = exports.CreatePromoCodeDto = exports.CreatePromotionDto = exports.PromotionType = void 0;
var PromotionType;
(function (PromotionType) {
    PromotionType["BOGO"] = "BOGO";
    PromotionType["BUY_X_GET_Y_FREE"] = "BUY_X_GET_Y_FREE";
    PromotionType["BUY_X_GET_Y_PERCENT_OFF"] = "BUY_X_GET_Y_PERCENT_OFF";
    PromotionType["FIXED_AMOUNT_OFF"] = "FIXED_AMOUNT_OFF";
    PromotionType["PERCENTAGE_OFF"] = "PERCENTAGE_OFF";
    PromotionType["FREE_ITEM"] = "FREE_ITEM";
    PromotionType["TIER_DISCOUNT"] = "TIER_DISCOUNT";
    PromotionType["STAFF_VOUCHER"] = "STAFF_VOUCHER";
})(PromotionType || (exports.PromotionType = PromotionType = {}));
class CreatePromotionDto {
    name;
    description;
    type;
    buyQuantity;
    getQuantity;
    discountValue;
    maxDiscountAmount;
    minOrderAmount;
    isActive;
    validFrom;
    validUntil;
    applicableProductIds;
    freeItemProductId;
    tierThresholds;
    happyHourDays;
    happyHourStart;
    happyHourEnd;
    customerSegment;
    isBirthdayBonus;
}
exports.CreatePromotionDto = CreatePromotionDto;
class CreatePromoCodeDto {
    code;
    promotionId;
    maxUsages;
    maxUsagesPerCustomer;
    firstOrderOnly;
    isStackable;
    staffOnly;
}
exports.CreatePromoCodeDto = CreatePromoCodeDto;
class LogRedemptionDto {
    promoCodeId;
    offerCode;
    customerId;
    orderId;
    discountApplied;
}
exports.LogRedemptionDto = LogRedemptionDto;
//# sourceMappingURL=promotion.dto.js.map