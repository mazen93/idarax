import { PrismaService } from '../../prisma/prisma.service';
export interface CreateAuditLogDto {
    tenantId: string;
    userId?: string;
    userEmail?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    meta?: Record<string, any>;
    ipAddress?: string;
}
export declare class AuditLogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(dto: CreateAuditLogDto): Promise<void>;
    findAll(tenantId: string, filters?: {
        userId?: string;
        action?: string;
        resourceType?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            lastPage: number;
            limit: number;
        };
    }>;
}
