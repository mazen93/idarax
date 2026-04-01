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
declare const UpdatePurchaseOrderDto_base: import("@nestjs/common").Type<Partial<CreatePurchaseOrderDto>>;
export declare class UpdatePurchaseOrderDto extends UpdatePurchaseOrderDto_base {
}
export declare class UpdatePurchaseOrderStatusDto {
    status: 'PENDING' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
    receivedItems?: {
        productId: string;
        quantity: number;
    }[];
}
export {};
