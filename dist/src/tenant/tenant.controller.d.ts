import { PrismaService } from '../prisma/prisma.service';
export declare class TenantAdminController {
    private prisma;
    constructor(prisma: PrismaService);
    getAllTenants(req: any): Promise<({
        users: {
            createdAt: Date;
            name: string;
            email: string;
        }[];
        _count: {
            orders: number;
            products: number;
            users: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        domain: string | null;
        type: import(".prisma/client").$Enums.TenantType;
        updatedAt: Date;
    })[]>;
}
