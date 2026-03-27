import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TenantMiddleware implements NestMiddleware {
    private readonly tenantService;
    private readonly prisma;
    constructor(tenantService: TenantService, prisma: PrismaService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
