import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Actions.DASHBOARD.VIEW)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('overview')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getOverview(@Query('start') start?: string, @Query('end') end?: string) {
        return this.analyticsService.getOverview(
            start ? new Date(start) : undefined,
            end ? new Date(end) : undefined
        );
    }

    @Get('revenue-chart')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getRevenueChart(@Query('start') start?: string, @Query('end') end?: string) {
        return this.analyticsService.getRevenueChartData(
            start ? new Date(start) : undefined,
            end ? new Date(end) : undefined
        );
    }

    @Get('inventory-stats')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getInventoryStats() {
        return this.analyticsService.getInventoryStats();
    }

    @Get('sales')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getSales(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        return this.analyticsService.getSalesReport(new Date(start), new Date(end));
    }

    @Get('top-products')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getTopProducts(@Query('limit') limit: string) {
        return this.analyticsService.getTopProducts(parseInt(limit) || 5);
    }

    private parseDateRange(start?: string, end?: string): { startDate: Date, endDate: Date } {
        // If start is provided, use it (new Date("YYYY-MM-DD") is UTC 00:00)
        // If not provided, use local today at 00:00 (consistent with dashboard default)
        let startDate: Date;
        if (start && start.trim() !== '') {
            startDate = new Date(start);
            if (isNaN(startDate.getTime())) {
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
            }
        } else {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
        }

        let endDate: Date;
        if (end && end.trim() !== '') {
            endDate = new Date(end);
            if (isNaN(endDate.getTime())) {
                endDate = new Date();
            } else {
                endDate.setUTCHours(23, 59, 59, 999);
            }
        } else {
            endDate = new Date(); // Right now
        }

        return { startDate, endDate };
    }

    @Get('reports/sales-summary')
    @Permissions(Actions.REPORTS.VIEW_DAILY)
    getDailySalesSummary(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('branchId') branchId?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getDailySalesSummary(startDate, endDate, branchId);
    }

    @Get('reports/payment-reconciliation')
    @Permissions(Actions.REPORTS.VIEW_DAILY)
    getPaymentReconciliation(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('branchId') branchId?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getPaymentReconciliation(startDate, endDate, branchId);
    }

    @Get('reports/drawer-reconciliation')
    @Permissions(Actions.REPORTS.VIEW_DAILY)
    getCashDrawerReconciliation(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('branchId') branchId?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getCashDrawerReconciliation(startDate, endDate, branchId);
    }

    @Get('reports/inventory-valuation')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getInventoryValuation(
        @Query('branchId') branchId?: string,
    ) {
        return this.analyticsService.getInventoryValuation(branchId);
    }

    @Get('reports/inventory-movement')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getInventoryMovement(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('branchId') branchId?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getInventoryMovement(startDate, endDate, branchId);
    }

    @Get('reports/tax-liability')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getTaxLiability(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('branchId') branchId?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getTaxLiability(startDate, endDate, branchId);
    }

    @Get('reports/customer-summary')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getCustomerSalesSummary(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('branchId') branchId?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getCustomerSalesSummary(startDate, endDate, branchId);
    }

    @Get('reports/cashier-performance')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getCashierPerformance(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('branchId') branchId?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getCashierPerformance(startDate, endDate, branchId);
    }

    @Get('reports/staff-leaderboard')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getStaffLeaderboard(
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getStaffLeaderboard(startDate, endDate);
    }

    @Get('reports/kitchen-performance')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getKitchenPerformance(
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getKitchenPerformance(startDate, endDate);
    }

    @Get('reports/product-profitability')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getProductProfitability(
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        const { startDate, endDate } = this.parseDateRange(start, end);
        return this.analyticsService.getProductProfitability(startDate, endDate);
    }
}
