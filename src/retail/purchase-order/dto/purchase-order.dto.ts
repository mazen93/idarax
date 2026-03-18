export class CreatePurchaseOrderDto {
    vendorId: string;
    warehouseId?: string;
    branchId?: string;
    note?: string;
    items: CreatePurchaseOrderItemDto[];
}

export class CreatePurchaseOrderItemDto {
    productId: string;
    quantity: number;
    costPrice: number;
}

export class UpdatePurchaseOrderStatusDto {
    status: 'PENDING' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
    receivedItems?: { productId: string; quantity: number }[];
}
