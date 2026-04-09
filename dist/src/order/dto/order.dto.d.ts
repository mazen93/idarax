export declare class CreateOrderItemModifierDto {
    optionId: string;
}
export declare class CreateOrderItemDto {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    stationId?: string;
    note?: string;
    courseName?: string;
    modifiers?: CreateOrderItemModifierDto[];
    pointsCost?: number;
    isReward?: boolean;
}
export declare enum OrderType {
    DINE_IN = "DINE_IN",
    TAKEAWAY = "TAKEAWAY",
    DELIVERY = "DELIVERY",
    DRIVE_THRU = "DRIVE_THRU",
    CURBSIDE = "CURBSIDE",
    IN_STORE = "IN_STORE"
}
export declare class CreateOrderDto {
    tableId?: string;
    customerId?: string;
    items: CreateOrderItemDto[];
    totalAmount: number;
    offerCode?: string;
    discountAmount?: number;
    taxAmount?: number;
    serviceFeeAmount?: number;
    orderType?: OrderType;
    status?: string;
    guestName?: string;
    guestPhone?: string;
    note?: string;
    paidAmount?: number;
    paymentMethod?: string;
    deliveryAddress?: string;
    splitPayments?: {
        method: string;
        amount: number;
    }[];
    loyaltyPointsToRedeem?: number;
    rewards?: any[];
    redeemAsCashback?: boolean;
    scheduledAt?: string;
    isPreOrder?: boolean;
}
export declare class SplitBillDto {
    orderId: string;
    splitType: 'EQUAL' | 'BY_ITEM' | 'BY_AMOUNT';
    splits: {
        customerId: string;
        amount?: number;
        itemIds?: string[];
    }[];
}
export declare class RepeatOrderDto {
    orderId: string;
}
export declare class SendReceiptDto {
    email: string;
}
