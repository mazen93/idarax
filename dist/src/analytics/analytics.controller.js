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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const permissions_guard_1 = require("../auth/permissions.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const permissions_constants_1 = require("../auth/permissions.constants");
const feature_gate_guard_1 = require("../common/guards/feature-gate.guard");
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getOverview(start, end) {
        return this.analyticsService.getOverview(start ? new Date(start) : undefined, end ? new Date(end) : undefined);
    }
    getRevenueChart(start, end) {
        return this.analyticsService.getRevenueChartData(start ? new Date(start) : undefined, end ? new Date(end) : undefined);
    }
    getInventoryStats() {
        return this.analyticsService.getInventoryStats();
    }
    getSales(start, end) {
        return this.analyticsService.getSalesReport(new Date(start), new Date(end));
    }
    getTopProducts(limit) {
        return this.analyticsService.getTopProducts(parseInt(limit) || 5);
    }
    parseDateRange(start, end) {
        let startDate;
        if (start && start.trim() !== '') {
            startDate = new Date(start);
            if (isNaN(startDate.getTime())) {
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
            }
        }
        else {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
        }
        let endDate;
        if (end && end.trim() !== '') {
            endDate = new Date(end);
            if (isNaN(endDate.getTime())) {
                endDate = new Date();
            }
            else {
                endDate.setUTCHours(23, 59, 59, 999);
            }
        }
        else {
            endDate = new Date();
        }
        return { startDate, endDate };
    }
    getDailySalesSummary(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getDailySalesSummary(startDate, endDate, branchId);
    }
    getPaymentReconciliation(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getPaymentReconciliation(startDate, endDate, branchId);
    }
    getCashDrawerReconciliation(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getCashDrawerReconciliation(startDate, endDate, branchId);
    }
    getInventoryValuation(branchId) {
        return this.analyticsService.getInventoryValuation(branchId);
    }
    getInventoryMovement(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getInventoryMovement(startDate, endDate, branchId);
    }
    getTaxLiability(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getTaxLiability(startDate, endDate, branchId);
    }
    getCustomerSalesSummary(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getCustomerSalesSummary(startDate, endDate, branchId);
    }
    getCashierPerformance(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getCashierPerformance(startDate, endDate, branchId);
    }
    getStaffLeaderboard(start, end) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getStaffLeaderboard(startDate, endDate);
    }
    getKitchenPerformance(start, end) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getKDS2Analytics(startDate, endDate);
    }
    getKDS2Analytics(start, end) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getKDS2Analytics(startDate, endDate);
    }
    getProductProfitability(start, end) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getProductProfitability(startDate, endDate);
    }
    getPeakHours(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getPeakHours(startDate, endDate, branchId);
    }
    getBusiestDays(start, end, branchId) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getBusiestDays(startDate, endDate, branchId);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('revenue-chart'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRevenueChart", null);
__decorate([
    (0, common_1.Get)('inventory-stats'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getInventoryStats", null);
__decorate([
    (0, common_1.Get)('sales'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getSales", null);
__decorate([
    (0, common_1.Get)('top-products'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.Get)('reports/sales-summary'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_DAILY),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getDailySalesSummary", null);
__decorate([
    (0, common_1.Get)('reports/payment-reconciliation'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_DAILY),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPaymentReconciliation", null);
__decorate([
    (0, common_1.Get)('reports/drawer-reconciliation'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_DAILY),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCashDrawerReconciliation", null);
__decorate([
    (0, common_1.Get)('reports/inventory-valuation'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getInventoryValuation", null);
__decorate([
    (0, common_1.Get)('reports/inventory-movement'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getInventoryMovement", null);
__decorate([
    (0, common_1.Get)('reports/tax-liability'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTaxLiability", null);
__decorate([
    (0, common_1.Get)('reports/customer-summary'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('ADVANCED_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCustomerSalesSummary", null);
__decorate([
    (0, common_1.Get)('reports/cashier-performance'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('ADVANCED_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getCashierPerformance", null);
__decorate([
    (0, common_1.Get)('reports/staff-leaderboard'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('ADVANCED_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getStaffLeaderboard", null);
__decorate([
    (0, common_1.Get)('reports/kitchen-performance'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('KDS_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getKitchenPerformance", null);
__decorate([
    (0, common_1.Get)('reports/kds-2-analytics'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('KDS_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getKDS2Analytics", null);
__decorate([
    (0, common_1.Get)('reports/product-profitability'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('ADVANCED_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getProductProfitability", null);
__decorate([
    (0, common_1.Get)('reports/peak-hours'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('ADVANCED_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPeakHours", null);
__decorate([
    (0, common_1.Get)('reports/busiest-days'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    (0, feature_gate_guard_1.Feature)('ADVANCED_ANALYTICS'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getBusiestDays", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard, feature_gate_guard_1.FeatureGateGuard),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.DASHBOARD.VIEW),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map