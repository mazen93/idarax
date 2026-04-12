import { PrismaService } from '../prisma/prisma.service';
export declare class TenantAdminController {
    private prisma;
    constructor(prisma: PrismaService);
    getAllTenants(req: any): Promise<({
        users: {
            name: string;
            createdAt: Date;
            email: string;
        }[];
        _count: {
            orders: number;
            products: number;
            users: number;
        };
    } & {
        isActive: boolean;
        id: string;
        name: string;
        slug: string | null;
        domain: string | null;
        customDomain: string | null;
        type: import(".prisma/client").$Enums.TenantType;
        createdAt: Date;
        updatedAt: Date;
        hasDeliveryIntegration: boolean;
        status: string;
        isTrial: boolean;
        maxBranches: number;
        maxUsers: number;
        maxPos: number;
        maxKds: number;
        subscriptionExpiresAt: Date | null;
        trialExpiresAt: Date | null;
        country: string | null;
        countryCode: string | null;
        vatNumber: string | null;
        planId: string | null;
    })[]>;
}
