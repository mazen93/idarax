import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
export declare class RoleService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateRoleDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateRoleDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
