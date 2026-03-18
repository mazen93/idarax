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
exports.StaffPermissionsController = void 0;
const common_1 = require("@nestjs/common");
const staff_permissions_service_1 = require("./staff-permissions.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_constants_1 = require("../auth/permissions.constants");
const swagger_1 = require("@nestjs/swagger");
let StaffPermissionsController = class StaffPermissionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getUsers(req) {
        return this.service.getAllUsersWithPermissions(req.user.tenantId);
    }
    async getUserPermissions(id) {
        return this.service.getUserPermissions(id);
    }
    async setPermissions(id, req, dto) {
        return this.service.setPermissions(id, req.user.tenantId, dto.actions);
    }
    getRoleDefaults() {
        return this.service.getRoleDefaults();
    }
    getAvailableActions() {
        return this.service.getAvailableActions();
    }
};
exports.StaffPermissionsController = StaffPermissionsController;
__decorate([
    (0, common_1.Get)('users'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List all users with their current permissions' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffPermissionsController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get permissions for a specific user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffPermissionsController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.ASSIGN_ROLES),
    (0, swagger_1.ApiOperation)({ summary: 'Set permissions for a specific user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StaffPermissionsController.prototype, "setPermissions", null);
__decorate([
    (0, common_1.Get)('roles/defaults'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get default permissions mapping for each role' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StaffPermissionsController.prototype, "getRoleDefaults", null);
__decorate([
    (0, common_1.Get)('actions'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.STAFF_MANAGEMENT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available actions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StaffPermissionsController.prototype, "getAvailableActions", null);
exports.StaffPermissionsController = StaffPermissionsController = __decorate([
    (0, swagger_1.ApiTags)('Staff Permissions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('staff/permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [staff_permissions_service_1.StaffPermissionsService])
], StaffPermissionsController);
//# sourceMappingURL=staff-permissions.controller.js.map