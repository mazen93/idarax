export declare class StartAuditDto {
    warehouseId: string;
    productIds?: string[];
}
export declare class AuditItemUpdateDto {
    productId: string;
    physicalQuantity: number;
}
export declare class UpdateAuditDto {
    items: AuditItemUpdateDto[];
}
