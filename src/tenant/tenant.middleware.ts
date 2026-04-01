import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';

const domainCache = new Map<string, { id: string | null; expires: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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
            const host = req.hostname; 
            if (host && !host.includes('localhost') && !host.includes('idarax.com') && !host.includes('127.0.0.1')) {
                const now = Date.now();
                const cached = domainCache.get(host);

                if (cached && cached.expires > now) {
                    if (cached.id) tenantId = cached.id;
                } else {
                    const tenant = await this.prisma.tenant.findUnique({
                        where: { domain: host }
                    });
                    
                    domainCache.set(host, { id: tenant?.id || null, expires: now + CACHE_TTL });
                    
                    if (tenant) {
                        tenantId = tenant.id;
                    }
                }
            }
        }

        if (tenantId) {
            this.tenantService.setContext(tenantId, branchId);
        }

        next();
    }
}
