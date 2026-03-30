import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReportingService } from './reporting.service';

@Injectable()
export class ReportingCronService {
    private readonly logger = new Logger(ReportingCronService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly reportingService: ReportingService,
    ) {}

    // Daily summary at 7:00 AM server time
    @Cron(CronExpression.EVERY_DAY_AT_7AM)
    async handleDailyReports() {
        this.logger.log('Starting daily sales reports cron job...');
        
        const tenants = await this.prisma.tenant.findMany({
            select: { id: true }
        });

        for (const tenant of tenants) {
            await this.reportingService.sendDailySummary(tenant.id);
        }

        this.logger.log(`Finished daily sales reports for ${tenants.length} tenants.`);
    }

    // Weekly summary on Monday at 8:00 AM server time
    @Cron('0 8 * * 1')
    async handleWeeklyReports() {
        this.logger.log('Starting weekly sales reports cron job...');

        const tenants = await this.prisma.tenant.findMany({
            select: { id: true }
        });

        for (const tenant of tenants) {
            await this.reportingService.sendWeeklySummary(tenant.id);
        }

        this.logger.log(`Finished weekly sales reports for ${tenants.length} tenants.`);
    }
}
