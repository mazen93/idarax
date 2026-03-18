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
exports.VendorController = void 0;
const common_1 = require("@nestjs/common");
const vendor_service_1 = require("./vendor.service");
const vendor_dto_1 = require("./dto/vendor.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let VendorController = class VendorController {
    vendorService;
    constructor(vendorService) {
        this.vendorService = vendorService;
    }
    create(dto) {
        return this.vendorService.create(dto);
    }
    findAll() {
        return this.vendorService.findAll();
    }
    update(id, dto) {
        return this.vendorService.update(id, dto);
    }
    remove(id) {
        return this.vendorService.remove(id);
    }
    linkProduct(id, dto) {
        return this.vendorService.linkProduct(id, dto);
    }
    unlinkProduct(id, productId) {
        return this.vendorService.unlinkProduct(id, productId);
    }
    getProducts(id) {
        return this.vendorService.getProducts(id);
    }
};
exports.VendorController = VendorController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vendor_dto_1.CreateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/products'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "linkProduct", null);
__decorate([
    (0, common_1.Delete)(':id/products/:productId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "unlinkProduct", null);
__decorate([
    (0, common_1.Get)(':id/products'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorController.prototype, "getProducts", null);
exports.VendorController = VendorController = __decorate([
    (0, common_1.Controller)('retail/vendors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vendor_service_1.VendorService])
], VendorController);
//# sourceMappingURL=vendor.controller.js.map