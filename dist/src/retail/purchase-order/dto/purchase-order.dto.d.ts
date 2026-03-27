export declare class CreatePurchaseOrderItemDto {
    productId: string;
    quantity: number;
    costPrice: number;
}
export declare class CreatePurchaseOrderDto {
    vendorId: string;
    warehouseId?: string;
    branchId?: string;
    note?: string;
    items: CreatePurchaseOrderItemDto[];
}
export declare class UpdatePurchaseOrderStatusDto {
    status: 'PENDING' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
    receivedItems?: {
        productId: string;
        quantity: number;
    }[];
}
