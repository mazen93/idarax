import { PrismaService } from '../prisma/prisma.service';
export declare class StaffPermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllUsersWithPermissions(tenantId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        branchId: string | null;
        permissions: {
            action: string;
        }[];
    }[]>;
    getUserPermissions(userId: string): Promise<string[]>;
    setPermissions(userId: string, tenantId: string, actions: string[]): Promise<{
        success: boolean;
        count: number;
    }>;
    getRoleDefaults(): Record<string, string[]>;
    getAvailableActions(): {
        ORDERS: {
            VIEW: string;
            CREATE: string;
            CANCEL: string;
            REFUND: string;
            VIEW_ALL: string;
        };
        POS: {
            ACCESS: string;
            APPLY_DISCOUNT: string;
            OVERRIDE_PRICE: string;
        };
        TABLES: {
            VIEW: string;
            MANAGE: string;
            MERGE: string;
            TRANSFER: string;
        };
        CUSTOMERS: {
            VIEW: string;
            CREATE: string;
            EDIT: string;
            DELETE: string;
        };
        CATALOG: {
            VIEW: string;
            CREATE: string;
            EDIT: string;
            DELETE: string;
        };
        INVENTORY: {
            VIEW: string;
            CREATE: string;
            ADJUST: string;
            TRANSFER: string;
        };
        REPORTS: {
            VIEW_DAILY: string;
            VIEW_ALL: string;
            EXPORT: string;
        };
        CASH_DRAWER: {
            OPEN: string;
            CLOSE: string;
            CASH_IN: string;
            CASH_OUT: string;
            VIEW_SUMMARY: string;
        };
        STAFF_MANAGEMENT: {
            VIEW: string;
            CREATE: string;
            EDIT: string;
            DELETE: string;
            ASSIGN_ROLES: string;
        };
        SETTINGS: {
            VIEW: string;
            EDIT: string;
        };
        OFFERS: {
            VIEW: string;
            CREATE: string;
            EDIT: string;
            DELETE: string;
        };
        KDS: {
            ACCESS: string;
        };
        DASHBOARD: {
            VIEW: string;
        };
        STAFF_SCHEDULE: {
            VIEW: string;
            MANAGE: string;
        };
    };
}
