import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(req: any, userId?: string, action?: string, resourceType?: string, from?: string, to?: string, page?: string, limit?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            lastPage: number;
            limit: number;
        };
    }>;
}
