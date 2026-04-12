import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: CreateUserDto): Promise<{
        permissions: string[];
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        pinCode: string | null;
        roleId: string | null;
    }>;
    findAll(): Promise<{
        permissions: string[];
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            description: string | null;
        }) | null;
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        fixedSalary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        permissions: string[];
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
    }>;
    remove(id: string): Promise<{
        isActive: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
        hourlyRate: import("@prisma/client/runtime/library").Decimal | null;
        fixedSalary: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
