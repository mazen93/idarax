import type { Response } from 'express';
import { ExportService } from './export.service';
import { ScheduledReportService } from './scheduled-report.service';
import { ReportType, ReportFormat } from '@prisma/client';
export declare class ExportController {
    private readonly exportService;
    private readonly schedulerService;
    constructor(exportService: ExportService, schedulerService: ScheduledReportService);
    downloadCsv(res: Response): Promise<Response<any, Record<string, any>>>;
    downloadPdf(res: Response): Promise<Response<any, Record<string, any>>>;
    createScheduled(dto: {
        type: ReportType;
        format: ReportFormat;
        recipientEmail: string;
    }): Promise<any>;
    listScheduled(): Promise<any>;
    removeScheduled(id: string): Promise<{
        success: boolean;
    }>;
    toggleScheduled(id: string, isActive: boolean): Promise<{
        success: boolean;
    }>;
}
