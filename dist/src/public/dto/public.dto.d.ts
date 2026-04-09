export declare class CreatePublicOrderItemModifierDto {
    optionId: string;
}
export declare class PublicOrderItemDto {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    modifiers?: CreatePublicOrderItemModifierDto[];
}
export declare class CreatePublicOrderDto {
    customerName: string;
    customerPhone?: string;
    totalAmount: number;
    orderType?: string;
    deliveryType?: string;
    tableId?: string;
    tableNumber?: string;
    branchId?: string;
    source?: string;
    note?: string;
    items: PublicOrderItemDto[];
    scheduledAt?: string;
    isPreOrder?: boolean;
}
