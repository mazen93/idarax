import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(
        private readonly tenantService: TenantService,
        private readonly prisma: PrismaService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        let tenantId = req.headers['x-tenant-id'] as string;
        const branchId = (req.headers['x-branch-id'] as string) || undefined;

        // White-labeling: Resolve tenant by custom domain if header is missing
        if (!tenantId) {
            const host = req.hostname; // e.g., 'burger.idarax.com'
            if (host && !host.includes('localhost') && !host.includes('idarax.com')) {
                const tenant = await this.prisma.tenant.findUnique({
                    where: { domain: host }
                });
                if (tenant) {
                    tenantId = tenant.id;
                }
            }
        }

        if (tenantId) {
            this.tenantService.setContext(tenantId, branchId);
        }

        next();
    }
}
