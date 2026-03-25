import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(dto: CreateUserDto): Promise<{
        permissions: string[];
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        pinCode: string | null;
        roleId: string | null;
    }>;
    findAll(): Promise<{
        permissions: string[];
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
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
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        branchId: string | null;
        pinCode: string | null;
        roleId: string | null;
    }>;
}
