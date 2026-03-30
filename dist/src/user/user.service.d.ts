import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateUserDto): Promise<{
        permissions: string[];
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        pinCode: string | null;
        roleId: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        permissions: string[];
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
        isActive: boolean;
        customRole: {
            id: string;
            name: string;
            permissions: {
                action: string;
            }[];
        } | null;
    }[]>;
    findOne(id: string): Promise<{
        permissions: string[];
        customRole: ({
            permissions: {
                action: string;
            }[];
        } & {
            id: string;
            name: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        }) | null;
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
        isActive: boolean;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        fixedSalary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        permissions: string[];
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
        isActive: boolean;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        fixedSalary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
