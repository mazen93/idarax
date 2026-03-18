import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ReportType, ReportFormat } from '@prisma/client';

@Injectable()
export class ScheduledReportService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        @InjectQueue('reports') private reportQueue: Queue,
    ) { }

    async create(dto: { type: ReportType, format: ReportFormat, recipientEmail: string }) {
        const tenantId = this.tenantService.getTenantId();
        const report = await (this.prisma as any).scheduledReport.create({
            data: {
                ...dto,
                tenantId,
            }
        });

        // Add to queue for processing based on type
        // For simplicity, we'll use cron expressions in Bull
        let cron = '';
        if (dto.type === 'DAILY_SALES') cron = '0 0 * * *'; // Daily at midnight
        else if (dto.type === 'WEEKLY_SALES') cron = '0 0 * * 0'; // Weekly on Sunday
        else if (dto.type === 'INVENTORY_VALUATION') cron = '0 0 * * *'; // Daily valuation

        await this.reportQueue.add('generate-report', { reportId: report.id }, {
            repeat: { cron },
            jobId: report.id, // Use report ID as job ID to avoid duplicates
        });

        return report;
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).scheduledReport.findMany({
            where: { tenantId }
        });
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        const report = await (this.prisma as any).scheduledReport.findFirst({
            where: { id, tenantId }
        });

        if (!report) throw new NotFoundException('Scheduled report not found');

        await (this.prisma as any).scheduledReport.delete({ where: { id } });
        await this.reportQueue.removeRepeatableByKey(report.id); // This might need refinement depending on how jobId/key is stored
        
        return { success: true };
    }

    async toggle(id: string, isActive: boolean) {
        const tenantId = this.tenantService.getTenantId();
        const report = await (this.prisma as any).scheduledReport.updateMany({
            where: { id, tenantId },
            data: { isActive }
        });

        if (report.count === 0) throw new NotFoundException('Scheduled report not found');

        // Logic to pause/resume Bull job could go here
        
        return { success: true };
    }
}
