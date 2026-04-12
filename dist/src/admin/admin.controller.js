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
exports.TenantSubscriptionController = exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const admin_dto_1 = require("./dto/admin.dto");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getPlatformOverview() {
        return this.adminService.getPlatformOverview();
    }
    getTenantsDetailed() {
        return this.adminService.getTenantsWithStats();
    }
    getFilteredTenants(plan, status, countryCode, search, page, limit) {
        return this.adminService.getFilteredTenants({
            plan,
            status,
            countryCode,
            search,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
        });
    }
    getSubscriptionAnalytics() {
        return this.adminService.getSubscriptionAnalytics();
    }
    getCountryAnalytics() {
        return this.adminService.getCountryAnalytics();
    }
    getAllPlans() {
        return this.adminService.getAllPlans(false);
    }
    getUpgradeRequests(status) {
        return this.adminService.getUpgradeRequests(status);
    }
    approveRequest(id) {
        return this.adminService.approveUpgradeRequest(id);
    }
    rejectRequest(id, body) {
        return this.adminService.rejectUpgradeRequest(id, body.note);
    }
    updateSubscription(id, dto) {
        return this.adminService.updateTenantSubscription(id, dto.planId, dto.durationDays);
    }
    extendTrial(id, dto) {
        return this.adminService.extendTrial(id, dto.days);
    }
    approveTenant(id) {
        return this.adminService.approveTenant(id);
    }
    getSettings() {
        return this.adminService.getGlobalSettings();
    }
    updateSetting(key, dto) {
        return this.adminService.updateGlobalSetting(key, dto.value);
    }
    getAuditLogs() {
        return this.adminService.getAuditLogs();
    }
    createPlan(dto) {
        return this.adminService.createPlan(dto);
    }
    updatePlan(id, dto) {
        return this.adminService.updatePlan(id, dto);
    }
    deletePlan(id) {
        return this.adminService.deletePlan(id);
    }
    overrideLimits(id, dto) {
        return this.adminService.updateTenantLimits(id, dto);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform-wide overview statistics (superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPlatformOverview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('tenants-detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenants with advanced stats (superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getTenantsDetailed", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('tenants'),
    (0, swagger_1.ApiOperation)({ summary: 'Get filtered/paginated tenant list (superadmin)' }),
    (0, swagger_1.ApiQuery)({ name: 'plan', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['ACTIVE', 'TRIAL', 'EXPIRED'] }),
    (0, swagger_1.ApiQuery)({ name: 'countryCode', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('plan')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('countryCode')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getFilteredTenants", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('subscription-analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed subscription analytics (superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubscriptionAnalytics", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('country-analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get geographical distribution analytics (superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCountryAnalytics", null);
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subscription plans (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllPlans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('upgrade-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upgrade requests (superadmin)' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUpgradeRequests", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('upgrade-requests/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve an upgrade request (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('upgrade-requests/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject an upgrade request (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('tenants/:id/subscription'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant subscription plan (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('tenants/:id/extend-trial'),
    (0, swagger_1.ApiOperation)({ summary: 'Extend tenant trial period (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "extendTrial", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('tenants/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Activate/Approve a pending tenant (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approveTenant", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global platform settings (superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('settings/:key'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a global platform setting (superadmin)' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSetting", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent system audit logs (superadmin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subscription plan (superadmin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.CreatePlanDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPlan", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('plans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subscription plan (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.UpdatePlanDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('plans/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subscription plan (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('tenants/:id/limits'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually override tenant limits e.g. maxPos (superadmin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_dto_1.TenantLimitOverrideDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "overrideLimits", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Superadmin Dashboard'),
    (0, common_1.Controller)('superadmin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
const common_2 = require("@nestjs/common");
let TenantSubscriptionController = class TenantSubscriptionController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getMySubscription(req) {
        return this.adminService.getMySubscription(req.user.tenantId);
    }
    requestUpgrade(req, dto) {
        return this.adminService.createUpgradeRequest(req.user.tenantId, dto.planId);
    }
    getPlans() {
        return this.adminService.getAllPlans(true);
    }
};
exports.TenantSubscriptionController = TenantSubscriptionController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current tenant subscription info' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantSubscriptionController.prototype, "getMySubscription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('upgrade-request'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit an upgrade request for current tenant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TenantSubscriptionController.prototype, "requestUpgrade", null);
__decorate([
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List all available subscription plans (public)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantSubscriptionController.prototype, "getPlans", null);
exports.TenantSubscriptionController = TenantSubscriptionController = __decorate([
    (0, swagger_1.ApiTags)('Tenant Subscription'),
    (0, common_2.Controller)('tenant/subscription'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], TenantSubscriptionController);
//# sourceMappingURL=admin.controller.js.map