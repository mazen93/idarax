import { BranchService } from './branch.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
export declare class BranchController {
    private readonly branchService;
    constructor(branchService: BranchService);
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
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
        nameAr: string | null;
    })[]>;
    findOne(id: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
        nameAr: string | null;
    }>;
    create(dto: CreateBranchDto): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
        nameAr: string | null;
    }>;
    update(id: string, dto: UpdateBranchDto): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
        nameAr: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        phone: string | null;
        address: string | null;
        businessDayStartHour: number;
        nameAr: string | null;
    }>;
}
