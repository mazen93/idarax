import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ExportService } from './export.service';
export declare class ScheduledReportProcessor {
    private prisma;
    private exportService;
    private readonly logger;
    constructor(prisma: PrismaService, exportService: ExportService);
    handleGenerateReport(job: Job<{
        reportId: string;
    }>): Promise<void>;
    private sendEmail;
}
