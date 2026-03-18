import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
export declare class TableService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateTableDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    moveOrder(sourceTableId: string, targetTableId: string): Promise<any>;
    mergeTables(sourceId: string, targetId: string): Promise<any>;
    unmergeTable(id: string): Promise<any>;
    checkout(id: string): Promise<{
        message: string;
        orders: any;
    }>;
    update(id: string, dto: UpdateTableDto): Promise<any>;
    remove(id: string): Promise<any>;
}
