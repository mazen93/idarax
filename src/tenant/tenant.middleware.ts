import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly tenantService: TenantService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.headers['x-tenant-id'] as string;
        const branchId = (req.headers['x-branch-id'] as string) || undefined;

        if (tenantId) {
            this.tenantService.setContext(tenantId, branchId);
        }

        next();
    }
}
