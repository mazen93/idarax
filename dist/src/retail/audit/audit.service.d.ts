import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { StartAuditDto, UpdateAuditDto } from './dto/audit.dto';
export declare class AuditService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    startAudit(dto: StartAuditDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    updateAudit(id: string, dto: UpdateAuditDto): Promise<any>;
    commitAudit(id: string): Promise<any>;
    cancelAudit(id: string): Promise<any>;
}
