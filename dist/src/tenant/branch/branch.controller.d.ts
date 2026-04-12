import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
    findAll(): Promise<({
        users: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            pinCode: string | null;
        }[];
        _count: {
            orders: number;
            tables: number;
        };
    } & {
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
        businessDayStartHour: number;
    })[]>;
    findOne(id: string): Promise<{
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
        businessDayStartHour: number;
    }>;
    create(dto: CreateBranchDto): Promise<{
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
        businessDayStartHour: number;
    }>;
    update(id: string, dto: UpdateBranchDto): Promise<{
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
        businessDayStartHour: number;
    }>;
    remove(id: string): Promise<{
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        nameAr: string | null;
        address: string | null;
        phone: string | null;
        businessDayStartHour: number;
    }>;
}
