"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePurchaseOrderStatusDto = exports.CreatePurchaseOrderItemDto = exports.CreatePurchaseOrderDto = void 0;
class CreatePurchaseOrderDto {
    vendorId;
    warehouseId;
    branchId;
    note;
    items;
}
exports.CreatePurchaseOrderDto = CreatePurchaseOrderDto;
class CreatePurchaseOrderItemDto {
    productId;
    quantity;
    costPrice;
}
exports.CreatePurchaseOrderItemDto = CreatePurchaseOrderItemDto;
class UpdatePurchaseOrderStatusDto {
    status;
    receivedItems;
}
exports.UpdatePurchaseOrderStatusDto = UpdatePurchaseOrderStatusDto;
//# sourceMappingURL=purchase-order.dto.js.map