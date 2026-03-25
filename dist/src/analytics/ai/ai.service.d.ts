import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
export declare class AiService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    forecastStock(productId: string): Promise<{
        daysRemaining: string;
        status: string;
        confidence: string;
        productName?: undefined;
        currentStock?: undefined;
        avgDailySales?: undefined;
        trend?: undefined;
        recommendedRestock?: undefined;
    } | {
        productName: any;
        currentStock: any;
        avgDailySales: string;
        daysRemaining: number;
        trend: string;
        status: string;
        recommendedRestock: number;
        confidence: string;
    }>;
    predictRevenue(days?: number): Promise<{
        forecast: never[];
        totalProjected: number;
        avgDailyHistorical?: undefined;
    } | {
        forecast: {
            date: string;
            amount: number;
        }[];
        totalProjected: number;
        avgDailyHistorical: number;
    }>;
    getRecommendations(productId: string): Promise<any>;
    getUpsellRecommendations(productIds: string[]): Promise<any>;
    getInventoryPredictions(): Promise<any>;
}
