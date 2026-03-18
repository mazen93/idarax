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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
const menu_dto_1 = require("./dto/menu.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
const swagger_1 = require("@nestjs/swagger");
let MenuController = class MenuController {
    menuService;
    constructor(menuService) {
        this.menuService = menuService;
    }
    create(dto) {
        return this.menuService.create(dto);
    }
    findAll(branchId) {
        return this.menuService.findAll(branchId);
    }
    findActive(branchId) {
        return this.menuService.findActive(branchId);
    }
    findOne(id) {
        return this.menuService.findOne(id);
    }
    update(id, dto) {
        return this.menuService.update(id, dto);
    }
    remove(id) {
        return this.menuService.remove(id);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [menu_dto_1.CreateMenuDto]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    (0, swagger_1.ApiQuery)({ name: 'branchId', required: false }),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get currently active menus based on current time and day' }),
    (0, swagger_1.ApiQuery)({ name: 'branchId', required: false }),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.VIEW),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, menu_dto_1.UpdateMenuDto]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CATALOG.DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MenuController.prototype, "remove", null);
exports.MenuController = MenuController = __decorate([
    (0, swagger_1.ApiTags)('Retail Menus'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('retail/menus'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map