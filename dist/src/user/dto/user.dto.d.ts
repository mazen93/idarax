export declare enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    STAFF = "STAFF",
    KITCHEN_STAFF = "KITCHEN_STAFF"
}
export declare class CreateUserDto {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    roleId?: string;
    pinCode?: string;
    permissions?: string[];
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    roleId?: string;
    pinCode?: string;
    permissions?: string[];
}
