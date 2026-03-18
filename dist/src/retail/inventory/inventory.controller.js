"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const inventory_dto_1 = require("./dto/inventory.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    createWarehouse(dto) {
        return this.inventoryService.createWarehouse(dto);
    }
    getWarehouses() {
        return this.inventoryService.getWarehouses();
    }
    adjustStock(dto) {
        return this.inventoryService.adjustStock(dto);
    }
    performStocktake(dto) {
        return this.inventoryService.performStocktake(dto);
    }
    getMovements() {
        return this.inventoryService.getStockMovements();
    }
    getProductStock(productId) {
        return this.inventoryService.getProductStock(productId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('warehouses'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateWarehouseDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createWarehouse", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getWarehouses", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.ADJUST),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.AdjustStockDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)('stocktake'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.ADJUST),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.StocktakeDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "performStocktake", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Get)('stock/:productId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.INVENTORY.VIEW),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getProductStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('retail/inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map