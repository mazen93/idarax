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
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        roleId: string | null;
        pinCode: string | null;
    }>;
    findAll(): Promise<{
        permissions: string[];
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        roleId: string | null;
        branchId: string | null;
        pinCode: string | null;
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
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            description: string | null;
        }) | null;
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        roleId: string | null;
        branchId: string | null;
        pinCode: string | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        permissions: string[];
        id: string;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        roleId: string | null;
        branchId: string | null;
        pinCode: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.UserRole;
        roleId: string | null;
        branchId: string | null;
        pinCode: string | null;
    }>;
}
