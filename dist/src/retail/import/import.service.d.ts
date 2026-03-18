import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
export interface ImportResults {
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
}
export declare class ImportService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    importProducts(file: Express.Multer.File, mode?: 'OVERRIDE' | 'SKIP_EXISTING'): Promise<ImportResults>;
    importCustomers(file: Express.Multer.File, mode?: 'OVERRIDE' | 'SKIP_EXISTING'): Promise<ImportResults>;
}
