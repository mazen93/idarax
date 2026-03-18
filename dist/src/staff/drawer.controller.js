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
exports.DrawerController = void 0;
const common_1 = require("@nestjs/common");
const drawer_service_1 = require("./drawer.service");
const drawer_dto_1 = require("./dto/drawer.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_constants_1 = require("../auth/permissions.constants");
const swagger_1 = require("@nestjs/swagger");
let DrawerController = class DrawerController {
    drawerService;
    constructor(drawerService) {
        this.drawerService = drawerService;
    }
    open(req, dto) {
        console.log('DEBUG: staff/drawer/open payload:', JSON.stringify(dto));
        return this.drawerService.openDrawer(req.user.id, dto);
    }
    close(req, dto) {
        return this.drawerService.closeDrawer(req.user.id, dto);
    }
    addMovement(req, dto) {
        return this.drawerService.addMovement(req.user.id, dto);
    }
    getCurrent(req) {
        return this.drawerService.getCurrentSession(req.user.id);
    }
    getReport(id) {
        return this.drawerService.getReport(id);
    }
    getHistory(from, to, branchId) {
        return this.drawerService.getHistory(from ? new Date(from) : undefined, to ? new Date(to) : undefined, branchId);
    }
};
exports.DrawerController = DrawerController;
__decorate([
    (0, common_1.Post)('open'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CASH_DRAWER.OPEN),
    (0, swagger_1.ApiOperation)({ summary: 'Open cash drawer session' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, drawer_dto_1.OpenDrawerDto]),
    __metadata("design:returntype", void 0)
], DrawerController.prototype, "open", null);
__decorate([
    (0, common_1.Post)('close'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CASH_DRAWER.CLOSE),
    (0, swagger_1.ApiOperation)({ summary: 'Close cash drawer session with counted balance' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, drawer_dto_1.CloseDrawerDto]),
    __metadata("design:returntype", void 0)
], DrawerController.prototype, "close", null);
__decorate([
    (0, common_1.Post)('movement'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CASH_DRAWER.CASH_OUT),
    (0, swagger_1.ApiOperation)({ summary: 'Record manual Cash In or Cash Out' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, drawer_dto_1.AddMovementDto]),
    __metadata("design:returntype", void 0)
], DrawerController.prototype, "addMovement", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CASH_DRAWER.VIEW_SUMMARY),
    (0, swagger_1.ApiOperation)({ summary: 'Get current open drawer session for logged-in user' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DrawerController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Get)('report/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CASH_DRAWER.VIEW_SUMMARY),
    (0, swagger_1.ApiOperation)({ summary: 'Get Z-Report for a drawer session' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DrawerController.prototype, "getReport", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.CASH_DRAWER.VIEW_SUMMARY),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get all drawer sessions' }),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DrawerController.prototype, "getHistory", null);
exports.DrawerController = DrawerController = __decorate([
    (0, swagger_1.ApiTags)('Staff - Drawer'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('staff/drawer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [drawer_service_1.DrawerService])
], DrawerController);
//# sourceMappingURL=drawer.controller.js.map