import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
export declare class MarketingService {
    private prisma;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    handleMarketingCron(): Promise<void>;
    runWinBackCampaign(tenantId?: string): Promise<void>;
    runBirthdayCampaign(tenantId?: string): Promise<void>;
    private sendCampaignEmail;
    getCampaignRule(tenantId: string): Promise<any>;
    updateCampaignRule(tenantId: string, data: any): Promise<any>;
    getCampaignStats(tenantId: string): Promise<{
        totalSent: any;
        totalConverted: any;
        conversionRate: string;
        totalRevenue: any;
        recentCampaigns: any;
    }>;
}
