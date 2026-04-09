import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
    findAll(): Promise<({
        _count: {
            orders: number;
            tables: number;
        };
        users: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            pinCode: string | null;
        }[];
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
