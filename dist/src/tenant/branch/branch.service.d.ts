import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant.service';
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
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        businessDayStartHour: number;
    })[]>;
    findOne(id: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        businessDayStartHour: number;
    }>;
    create(dto: any): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        businessDayStartHour: number;
    }>;
    update(id: string, dto: any): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        businessDayStartHour: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        address: string | null;
        phone: string | null;
        nameAr: string | null;
        businessDayStartHour: number;
    }>;
}
