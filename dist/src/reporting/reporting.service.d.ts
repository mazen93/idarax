import { AnalyticsService } from '../analytics/analytics.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
export declare class ReportingService {
    private readonly analyticsService;
    private readonly mailService;
    private readonly prisma;
    private readonly tenantService;
    private readonly logger;
    constructor(analyticsService: AnalyticsService, mailService: MailService, prisma: PrismaService, tenantService: TenantService);
    sendDailySummary(tenantId: string): Promise<void>;
    sendWeeklySummary(tenantId: string): Promise<void>;
    private generateHtmlReport;
}
