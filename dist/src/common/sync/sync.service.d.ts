import { PrismaService } from '../../prisma/prisma.service';
export declare class SyncService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processSyncBatch(tenantId: string, branchId: string, orders: any[]): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }>;
}
