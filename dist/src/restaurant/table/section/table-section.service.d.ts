import { PrismaService } from '../../../prisma/prisma.service';
import { TenantService } from '../../../tenant/tenant.service';
import { CreateTableSectionDto, UpdateTableSectionDto } from './dto/table-section.dto';
export declare class TableSectionService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateTableSectionDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateTableSectionDto): Promise<any>;
    remove(id: string): Promise<any>;
}
