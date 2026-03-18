export declare class CreateWarehouseDto {
    name: string;
    location?: string;
}
export declare class AdjustStockDto {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: any;
    referenceId?: string;
    reason?: string;
}
export declare class StocktakeItemDto {
    productId: string;
    physicalQuantity: number;
}
export declare class StocktakeDto {
    warehouseId: string;
    items: StocktakeItemDto[];
}
export declare class WarehouseQueryDto {
    tenantId?: string;
}
