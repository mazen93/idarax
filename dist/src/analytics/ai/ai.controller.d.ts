import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    forecast(productId: string): Promise<{
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
    recommendations(productId: string): Promise<any>;
    revenueForecast(): Promise<{
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
    upsell(productIds: string): Promise<any>;
    inventoryPredictions(): Promise<any>;
}
