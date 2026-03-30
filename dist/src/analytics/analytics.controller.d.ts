import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(start?: string, end?: string): Promise<{
        grossSales: number;
        netSales: number;
        totalCost: number;
        netProfit: number;
        orderCount: any;
        liveKdsTickets: any;
        lowStockCount: any;
        activeTables: any;
    }>;
    getRevenueChart(start?: string, end?: string): Promise<{
        date: string;
        amount: number;
    }[]>;
    getInventoryStats(): Promise<{
        lowStockItems: any;
    }>;
    getSales(start: string, end: string): Promise<{
        totalRevenue: number;
        netSales: number;
        totalCost: number;
        netProfit: number;
        orderCount: any;
        averageOrderValue: number;
        profitMargin: number;
    }>;
    getTopProducts(limit: string): Promise<unknown[]>;
    private parseDateRange;
    getDailySalesSummary(start?: string, end?: string, branchId?: string): Promise<unknown[]>;
    getPaymentReconciliation(start?: string, end?: string, branchId?: string): Promise<any>;
    getCashDrawerReconciliation(start?: string, end?: string, branchId?: string): Promise<any>;
    getInventoryValuation(branchId?: string): Promise<any[]>;
    getInventoryMovement(start?: string, end?: string, branchId?: string): Promise<any>;
    getTaxLiability(start?: string, end?: string, branchId?: string): Promise<unknown[]>;
    getCustomerSalesSummary(start?: string, end?: string, branchId?: string): Promise<unknown[]>;
    getCashierPerformance(start?: string, end?: string, branchId?: string): Promise<unknown[]>;
    getStaffLeaderboard(start?: string, end?: string): Promise<{
        id: string;
        name: string;
        revenue: number;
        orderCount: number;
    }[]>;
    getKitchenPerformance(start?: string, end?: string): Promise<{
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
    getKDS2Analytics(start?: string, end?: string): Promise<{
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
    getProductProfitability(start?: string, end?: string): Promise<{
        name: string;
        quantity: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        margin: number;
    }[]>;
    getPeakHours(start?: string, end?: string, branchId?: string): Promise<{
        hour: number;
        orderCount: number;
        revenue: number;
    }[]>;
    getBusiestDays(start?: string, end?: string, branchId?: string): Promise<{
        id: number;
        day: string;
        orderCount: number;
        revenue: number;
    }[]>;
}
