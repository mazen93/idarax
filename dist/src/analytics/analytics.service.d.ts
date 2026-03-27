import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { DashboardGateway } from './dashboard.gateway';
export declare class AnalyticsService {
    private prisma;
    private tenantService;
    private dashboardGateway;
    constructor(prisma: PrismaService, tenantService: TenantService, dashboardGateway: DashboardGateway);
    private getQueryBranchId;
    getOverview(startDate?: Date, endDate?: Date): Promise<{
        grossSales: any;
        orderCount: any;
        liveKdsTickets: any;
        lowStockCount: any;
        activeTables: any;
    }>;
    getRevenueChartData(startDate?: Date, endDate?: Date): Promise<{
        date: string;
        amount: number;
    }[]>;
    getInventoryStats(): Promise<{
        lowStockItems: any;
    }>;
    getSalesReport(startDate: Date, endDate: Date): Promise<{
        totalRevenue: any;
        orderCount: any;
        averageOrderValue: number;
    }>;
    getTopProducts(limit?: number): Promise<unknown[]>;
    getDailySalesSummary(startDate: Date, endDate: Date, filterBranchId?: string): Promise<unknown[]>;
    getPaymentReconciliation(startDate: Date, endDate: Date, filterBranchId?: string): Promise<any>;
    getCashDrawerReconciliation(startDate: Date, endDate: Date, filterBranchId?: string): Promise<any>;
    getInventoryValuation(filterBranchId?: string): Promise<any[]>;
    getInventoryMovement(startDate: Date, endDate: Date, filterBranchId?: string): Promise<any>;
    getTaxLiability(startDate: Date, endDate: Date, filterBranchId?: string): Promise<unknown[]>;
    getCustomerSalesSummary(startDate: Date, endDate: Date, filterBranchId?: string): Promise<unknown[]>;
    getCashierPerformance(startDate: Date, endDate: Date, filterBranchId?: string): Promise<unknown[]>;
    getStaffLeaderboard(startDate: Date, endDate: Date): Promise<{
        id: string;
        name: string;
        revenue: number;
        orderCount: number;
    }[]>;
    getKDS2Analytics(startDate: Date, endDate: Date): Promise<{
        totalCompletedItems: any;
        hourlyThroughput: {
            hour: number;
            count: number;
        }[];
        stations: {
            name: string;
            totalItems: number;
            avgPrepMinutes: number;
            efficiencyScore: number;
            maxPrepMinutes: number;
        }[];
        busiestHour: string | null;
    }>;
    getProductProfitability(startDate: Date, endDate: Date): Promise<{
        name: string;
        quantity: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        margin: number;
    }[]>;
    pushStatsUpdate(tenantId: string, branchId?: string): Promise<void>;
}
