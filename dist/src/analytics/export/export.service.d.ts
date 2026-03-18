import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
export declare class ExportService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    exportOrdersToCsv(): Promise<string>;
    exportOrdersToPdf(): Promise<Uint8Array<ArrayBufferLike>>;
}
