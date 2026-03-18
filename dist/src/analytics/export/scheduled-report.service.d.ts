import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import type { Queue } from 'bull';
import { ReportType, ReportFormat } from '@prisma/client';
export declare class ScheduledReportService {
    private prisma;
    private tenantService;
    private reportQueue;
    constructor(prisma: PrismaService, tenantService: TenantService, reportQueue: Queue);
    create(dto: {
        type: ReportType;
        format: ReportFormat;
        recipientEmail: string;
    }): Promise<any>;
    findAll(): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    toggle(id: string, isActive: boolean): Promise<{
        success: boolean;
    }>;
}
