import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';
export declare class DrovoController {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleWebhook(tenantId: string, signature: string, payload: any, req: Request): Promise<{
        received: boolean;
    }>;
}
