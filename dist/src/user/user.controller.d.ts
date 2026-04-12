import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
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
