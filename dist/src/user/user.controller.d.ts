import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
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
