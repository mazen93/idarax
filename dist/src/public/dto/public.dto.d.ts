export declare class PublicOrderItemDto {
    productId: string;
    quantity: number;
    price: number;
}
export declare class CreatePublicOrderDto {
    customerName: string;
    customerPhone?: string;
    totalAmount: number;
    tableId?: string;
    branchId?: string;
    orderType?: string;
    items: PublicOrderItemDto[];
}
