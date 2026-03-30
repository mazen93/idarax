import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
export declare class BranchService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    private get db();
    findAll(): Promise<({
        _count: {
            orders: number;
            tables: number;
            users: number;
        };
    } & {
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
    })[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
    }>;
    create(dto: CreateBranchDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
    }>;
    update(id: string, dto: UpdateBranchDto): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        nameAr: string | null;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
    }>;
}
