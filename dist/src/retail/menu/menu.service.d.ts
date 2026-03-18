import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
export declare class MenuService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    private get db();
    create(dto: CreateMenuDto): Promise<any>;
    findAll(branchId?: string): Promise<any>;
    findActive(branchId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateMenuDto): Promise<any>;
    remove(id: string): Promise<any>;
}
