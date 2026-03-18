"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseQueryDto = exports.StocktakeDto = exports.StocktakeItemDto = exports.AdjustStockDto = exports.CreateWarehouseDto = void 0;
class CreateWarehouseDto {
    name;
    location;
}
exports.CreateWarehouseDto = CreateWarehouseDto;
class AdjustStockDto {
    productId;
    warehouseId;
    quantity;
    type;
    referenceId;
    reason;
}
exports.AdjustStockDto = AdjustStockDto;
class StocktakeItemDto {
    productId;
    physicalQuantity;
}
exports.StocktakeItemDto = StocktakeItemDto;
class StocktakeDto {
    warehouseId;
    items;
}
exports.StocktakeDto = StocktakeDto;
class WarehouseQueryDto {
    tenantId;
}
exports.WarehouseQueryDto = WarehouseQueryDto;
//# sourceMappingURL=inventory.dto.js.map