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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const tenant_cache_interceptor_1 = require("../../common/interceptors/tenant-cache.interceptor");
const product_service_1 = require("./product.service");
const product_dto_1 = require("./dto/product.dto");
const branch_product_dto_1 = require("./dto/branch-product.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
const swagger_1 = require("@nestjs/swagger");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    create(dto) {
        return this.productService.create(dto);
    }
    findAll(branchId) {
        return this.productService.findAll(branchId);
    }
    findByBarcode(barcode) {
        return this.productService.findByBarcode(barcode);
    }
    getBranchSettings(branchId) {
        return this.productService.getBranchSettings(branchId);
    }
    upsertBranchSetting(branchId, productId, dto) {
        return this.productService.upsertBranchSetting(branchId, productId, dto);
    }
    resetBranchSetting(branchId, productId) {
        return this.productService.resetBranchSetting(branchId, productId);
    }
    findOne(id) {
        return this.productService.findOne(id);
    }
    update(id, dto) {
        return this.productService.update(id, dto);
    }
    remove(id) {
        return this.productService.remove(id);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    (0, common_1.UseInterceptors)(tenant_cache_interceptor_1.TenantCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(15000),
    (0, swagger_1.ApiQuery)({ name: 'branchId', required: false, description: 'Filter products by branch availability' }),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('barcode/:barcode'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    __param(0, (0, common_1.Param)('barcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Get)('branch/:branchId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products with branch availability/price overrides' }),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getBranchSettings", null);
__decorate([
    (0, common_1.Put)('branch/:branchId/:productId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.EDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Enable/disable a product for a branch, or set a price override' }),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, branch_product_dto_1.UpsertBranchProductDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "upsertBranchSetting", null);
__decorate([
    (0, common_1.Delete)('branch/:branchId/:productId'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.EDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Reset a product to global defaults for a branch' }),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "resetBranchSetting", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "remove", null);
exports.ProductController = ProductController = __decorate([
    (0, swagger_1.ApiTags)('Retail Products'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('retail/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map