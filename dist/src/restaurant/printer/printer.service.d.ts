import { PrismaService } from '../../prisma/prisma.service';
export declare class PrinterService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        name: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        branchId: string | null;
        address: string | null;
        interface: string;
    }>;
    findAll(tenantId: string, branchId?: string): Promise<{
        id: string;
        name: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        branchId: string | null;
        address: string | null;
        interface: string;
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        branchId: string | null;
        address: string | null;
        interface: string;
    }>;
    update(id: string, tenantId: string, data: any): Promise<{
        id: string;
        name: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        branchId: string | null;
        address: string | null;
        interface: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        name: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        branchId: string | null;
        address: string | null;
        interface: string;
    }>;
}
