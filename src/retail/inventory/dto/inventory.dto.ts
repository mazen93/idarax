import { MovementType } from '@prisma/client';

export class CreateWarehouseDto {
    name: string;
    location?: string;
}

export class AdjustStockDto {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: any;
    referenceId?: string;
    reason?: string;
}

export class StocktakeItemDto {
    productId: string;
    physicalQuantity: number;
}

export class StocktakeDto {
    warehouseId: string;
    items: StocktakeItemDto[];
}

export class WarehouseQueryDto {
    tenantId?: string;
}
