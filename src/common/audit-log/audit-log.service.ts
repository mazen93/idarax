import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuditLogService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Record a sensitive operation.
     * Call this from any service where important state changes happen.
     */
    async log(dto: CreateAuditLogDto): Promise<void> {
        await (this.prisma as any).auditLog.create({ data: dto });
    }

    /**
     * Retrieve audit logs for a tenant, with optional filters.
     */
    async findAll(
        tenantId: string,
        filters: {
            userId?: string;
            action?: string;
            resourceType?: string;
            from?: string;
            to?: string;
            page?: number;
            limit?: number;
        } = {},
    ) {
        const { userId, action, resourceType, from, to, page = 1, limit = 50 } = filters;

        const where: any = { tenantId };
        if (userId) where.userId = userId;
        if (action) where.action = { contains: action, mode: 'insensitive' };
        if (resourceType) where.resourceType = resourceType;
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from);
            if (to) where.createdAt.lte = new Date(to);
        }

        const [data, total] = await Promise.all([
            (this.prisma as any).auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            (this.prisma as any).auditLog.count({ where }),
        ]);

        return { data, meta: { total, page, lastPage: Math.ceil(total / limit), limit } };
    }
}
