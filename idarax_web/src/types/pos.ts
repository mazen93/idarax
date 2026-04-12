export enum OrderType {
    DINE_IN = 'DINE_IN',
    TAKEAWAY = 'TAKEAWAY',
    DELIVERY = 'DELIVERY',
    DRIVE_THRU = 'DRIVE_THRU',
    CURBSIDE = 'CURBSIDE',
    IN_STORE = 'IN_STORE',
}

export interface CartItem {
    cartId: string;
    productId: string;
    name: string;
    nameAr?: string;
    price: number;
    quantity: number;
    variantName?: string;
    variantNameAr?: string;
    variantId?: string;
    note?: string;
    courseName?: string;
    isSaved?: boolean;
    modifiers?: { optionId: string, name: string, nameAr?: string, price: number }[];
    isReward?: boolean;
    pointsCost?: number;
    overridePrice?: number;
}

export interface POSSettings {
    taxRate: number;
    serviceFee: number;
    currency: string;
    logoUrl: string;
    receiptHeader: string;
    receiptFooter: string;
    receiptShowLogo: boolean;
    receiptShowTable: boolean;
    receiptShowCustomer: boolean;
    receiptShowOrderNumber: boolean;
    receiptFontSize: number;
    receiptQrCodeUrl: string;
    loyaltyRatioEarning: number;
    loyaltyRatioRedemption: number;
    receiptLanguage?: string;
    receiptShowTimestamp?: boolean;
    receiptShowOrderType?: boolean;
    receiptShowOperator?: boolean;
    receiptShowItemsDescription?: boolean;
    receiptShowItemsQty?: boolean;
    receiptShowItemsPrice?: boolean;
    receiptShowSubtotal?: boolean;
    receiptShowTax?: boolean;
    receiptShowServiceCharge?: boolean;
    receiptShowDiscount?: boolean;
    receiptShowTotal?: boolean;
    receiptShowPaymentMethod?: boolean;
    receiptShowBarcode?: boolean;
    preOrderEnabled?: boolean;
    preOrderMaxDaysAhead?: number;
    preOrderLeadMinutes?: number;
}

export interface OfferDetails {
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'DYNAMIC';
    value: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
}
