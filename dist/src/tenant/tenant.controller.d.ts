import { PrismaService } from '../prisma/prisma.service';
export declare class TenantAdminController {
    private prisma;
    constructor(prisma: PrismaService);
    getAllTenants(req: any): Promise<({
        _count: {
            orders: number;
            products: number;
            users: number;
        };
        users: {
            email: string;
            name: string;
            createdAt: Date;
        }[];
    } & {
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
    })[]>;
}
