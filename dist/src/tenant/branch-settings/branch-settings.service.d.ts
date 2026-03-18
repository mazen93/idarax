import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { UpdateBranchSettingsDto } from './dto/branch-settings.dto';
export declare class BranchSettingsService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    getByBranch(branchId: string): Promise<any>;
    upsert(branchId: string, dto: UpdateBranchSettingsDto): Promise<any>;
}
