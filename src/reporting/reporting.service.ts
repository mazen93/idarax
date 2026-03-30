import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class ReportingService {
    private readonly logger = new Logger(ReportingService.name);

    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly mailService: MailService,
        private readonly prisma: PrismaService,
        private readonly tenantService: TenantService,
    ) {}

    async sendDailySummary(tenantId: string) {
        try {
            // Set context for AnalyticsService
            this.tenantService.setContext(tenantId);

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const data = await this.analyticsService.getOverview(yesterday, today);
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
                include: { settings: true, users: { where: { role: 'ADMIN', isActive: true } } }
            });

            if (!tenant || tenant.users.length === 0) return;

            const html = this.generateHtmlReport(tenant, data, 'Daily', yesterday);
            const subject = `${tenant.name} - Daily Sales Summary (${yesterday.toLocaleDateString()})`;

            for (const user of tenant.users) {
                await this.mailService.sendMail(user.email, subject, html);
            }

            this.logger.log(`Daily summary sent for tenant ${tenant.name} (${tenantId})`);
        } catch (error) {
            this.logger.error(`Failed to send daily summary for tenant ${tenantId}: ${error.message}`);
        }
    }

    async sendWeeklySummary(tenantId: string) {
        try {
            this.tenantService.setContext(tenantId);

            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            lastWeek.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const data = await this.analyticsService.getOverview(lastWeek, today);
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
                include: { settings: true, users: { where: { role: 'ADMIN', isActive: true } } }
            });

            if (!tenant || tenant.users.length === 0) return;

            const html = this.generateHtmlReport(tenant, data, 'Weekly', lastWeek);
            const subject = `${tenant.name} - Weekly Sales Summary (${lastWeek.toLocaleDateString()} - ${new Date().toLocaleDateString()})`;

            for (const user of tenant.users) {
                await this.mailService.sendMail(user.email, subject, html);
            }

            this.logger.log(`Weekly summary sent for tenant ${tenant.name} (${tenantId})`);
        } catch (error) {
            this.logger.error(`Failed to send weekly summary for tenant ${tenantId}: ${error.message}`);
        }
    }

    private generateHtmlReport(tenant: any, data: any, type: string, startDate: Date) {
        const currency = tenant.settings?.currency || 'USD';
        const brandColor = tenant.settings?.brandColor || '#10b981';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.5; margin: 0; padding: 0; background-color: #f9fafb; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    .header { background: ${brandColor}; padding: 40px 20px; text-align: center; color: white; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
                    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
                    .content { padding: 32px 24px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
                    .card { padding: 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
                    .card-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                    .card-value { font-size: 20px; font-weight: 800; color: #1e293b; }
                    .footer { padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
                    .profit { color: #10b981; }
                    .loss { color: #ef4444; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${tenant.name}</h1>
                        <p>${type} Sales Summary - ${startDate.toLocaleDateString()}</p>
                    </div>
                    <div class="content">
                        <div class="grid">
                            <div class="card">
                                <div class="card-label">Gross Sales</div>
                                <div class="card-value">${currency} ${data.grossSales.toLocaleString()}</div>
                            </div>
                            <div class="card">
                                <div class="card-label">Net Sales</div>
                                <div class="card-value">${currency} ${data.netSales.toLocaleString()}</div>
                            </div>
                            <div class="card">
                                <div class="card-label">Total Cost</div>
                                <div class="card-value">${currency} ${data.totalCost.toLocaleString()}</div>
                            </div>
                            <div class="card">
                                <div class="card-label">Net Profit</div>
                                <div class="card-value ${data.netProfit >= 0 ? 'profit' : 'loss'}">
                                    ${currency} ${data.netProfit.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #f1f5f9; padding: 24px; border-radius: 12px; text-align: center;">
                            <div class="card-label">Order Count</div>
                            <div style="font-size: 32px; font-weight: 900; color: #0f172a;">${data.orderCount}</div>
                            <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Orders processed in this period</div>
                        </div>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} Idarax Solutions. All rights reserved.<br>
                        This is an automated report sent to authorized administrators.
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}
