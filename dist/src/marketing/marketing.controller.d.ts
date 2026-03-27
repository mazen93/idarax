import { MarketingService } from './marketing.service';
export declare class MarketingController {
    private readonly marketingService;
    constructor(marketingService: MarketingService);
    triggerWinBack(req: any): Promise<{
        status: string;
        message: string;
    }>;
    getStats(req: any): Promise<{
        totalSent: any;
        totalConverted: any;
        conversionRate: string;
        totalRevenue: any;
        recentCampaigns: any;
    }>;
    getRule(req: any): Promise<any>;
    updateRule(req: any): Promise<any>;
}
