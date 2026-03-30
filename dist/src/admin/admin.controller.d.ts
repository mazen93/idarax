import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getPlatformOverview(): Promise<{
        activeTenants: number;
        totalBranches: number;
        totalOrders: number;
        totalRevenue: number;
        mrr: number;
        activeSubscriptions: number;
        trialTenants: number;
        expiringSoon: number;
        newTenantsThisMonth: number;
        growthPercent: string | null;
    }>;
    getTenantsDetailed(): Promise<{
        branchCount: number;
        userCount: number;
        productCount: number;
        orderCount: number;
        _count: {
            orders: number;
            branches: number;
            products: number;
            users: number;
        };
        plan: {
            id: string;
            name: string;
            updatedAt: Date;
            isActive: boolean;
            maxBranches: number;
            maxUsers: number;
            maxPos: number;
            maxKds: number;
            price: import("@prisma/client/runtime/library").Decimal;
            features: string[];
            description: string | null;
            descriptionAr: string | null;
            featuresAr: string[];
            nameAr: string | null;
        } | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string | null;
        domain: string | null;
        customDomain: string | null;
        type: import(".prisma/client").$Enums.TenantType;
        hasDeliveryIntegration: boolean;
        planId: string | null;
        isTrial: boolean;
        maxBranches: number;
        maxUsers: number;
        maxPos: number;
        maxKds: number;
        subscriptionExpiresAt: Date | null;
        trialExpiresAt: Date | null;
    }[]>;
    getFilteredTenants(plan?: string, status?: string, search?: string, page?: string, limit?: string): Promise<{
        data: {
            orderCount: number;
            userCount: number;
            branchCount: number;
            subscriptionStatus: string;
            _count: {
                orders: number;
                branches: number;
                users: number;
            };
            plan: {
                id: string;
                name: string;
                updatedAt: Date;
                isActive: boolean;
                maxBranches: number;
                maxUsers: number;
                maxPos: number;
                maxKds: number;
                price: import("@prisma/client/runtime/library").Decimal;
                features: string[];
                description: string | null;
                descriptionAr: string | null;
                featuresAr: string[];
                nameAr: string | null;
            } | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string | null;
            domain: string | null;
            customDomain: string | null;
            type: import(".prisma/client").$Enums.TenantType;
            hasDeliveryIntegration: boolean;
            planId: string | null;
            isTrial: boolean;
            maxBranches: number;
            maxUsers: number;
            maxPos: number;
            maxKds: number;
            subscriptionExpiresAt: Date | null;
            trialExpiresAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    getSubscriptionAnalytics(): Promise<{
        totalMrr: number;
        planBreakdown: {
            planId: string;
            planName: string;
            price: number;
            tenantCount: number;
            mrr: number;
        }[];
        monthlyGrowth: {
            month: string;
            count: number;
        }[];
        conversionRate: string;
        expiringSoon: {
            id: string;
            name: string;
            plan: {
                id: string;
                name: string;
                updatedAt: Date;
                isActive: boolean;
                maxBranches: number;
                maxUsers: number;
                maxPos: number;
                maxKds: number;
                price: import("@prisma/client/runtime/library").Decimal;
                features: string[];
                description: string | null;
                descriptionAr: string | null;
                featuresAr: string[];
                nameAr: string | null;
            } | null;
            subscriptionExpiresAt: Date | null;
        }[];
    }>;
    getAllPlans(): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        maxBranches: number;
        maxUsers: number;
        maxPos: number;
        maxKds: number;
        price: import("@prisma/client/runtime/library").Decimal;
        features: string[];
        description: string | null;
        descriptionAr: string | null;
        featuresAr: string[];
        nameAr: string | null;
    }[]>;
    getUpgradeRequests(status?: string): Promise<any>;
    approveRequest(id: string): Promise<any>;
    rejectRequest(id: string, body: {
        note?: string;
    }): Promise<any>;
    updateSubscription(id: string, dto: {
        planId: string;
        durationDays: number;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string | null;
        domain: string | null;
        customDomain: string | null;
        type: import(".prisma/client").$Enums.TenantType;
        hasDeliveryIntegration: boolean;
        planId: string | null;
        isTrial: boolean;
        maxBranches: number;
        maxUsers: number;
        maxPos: number;
        maxKds: number;
        subscriptionExpiresAt: Date | null;
        trialExpiresAt: Date | null;
    }>;
    extendTrial(id: string, dto: {
        days: number;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string | null;
        domain: string | null;
        customDomain: string | null;
        type: import(".prisma/client").$Enums.TenantType;
        hasDeliveryIntegration: boolean;
        planId: string | null;
        isTrial: boolean;
        maxBranches: number;
        maxUsers: number;
        maxPos: number;
        maxKds: number;
        subscriptionExpiresAt: Date | null;
        trialExpiresAt: Date | null;
    }>;
    getSettings(): Promise<Record<string, any>>;
    updateSetting(key: string, dto: {
        value: any;
    }): Promise<any>;
    getAuditLogs(): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        userId: string | null;
        ipAddress: string | null;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        action: string;
        userEmail: string | null;
        resourceType: string | null;
        resourceId: string | null;
    }[]>;
}
export declare class TenantSubscriptionController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getMySubscription(req: any): Promise<{
        currentPlan: {
            id: string;
            name: string;
            updatedAt: Date;
            isActive: boolean;
            maxBranches: number;
            maxUsers: number;
            maxPos: number;
            maxKds: number;
            price: import("@prisma/client/runtime/library").Decimal;
            features: string[];
            description: string | null;
            descriptionAr: string | null;
            featuresAr: string[];
            nameAr: string | null;
        } | null;
        status: string;
        expiresAt: Date | null;
        isTrial: boolean;
        trialExpiresAt: Date | null;
        pendingUpgradeRequest: any;
    }>;
    requestUpgrade(req: any, dto: {
        planId: string;
    }): Promise<any>;
    getPlans(): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        isActive: boolean;
        maxBranches: number;
        maxUsers: number;
        maxPos: number;
        maxKds: number;
        price: import("@prisma/client/runtime/library").Decimal;
        features: string[];
        description: string | null;
        descriptionAr: string | null;
        featuresAr: string[];
        nameAr: string | null;
    }[]>;
}
