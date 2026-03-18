import { PrismaService } from '../../prisma/prisma.service';
export declare class PrinterService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        type: string;
        updatedAt: Date;
        address: string | null;
        branchId: string | null;
        interface: string;
    }>;
    findAll(tenantId: string, branchId?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        type: string;
        updatedAt: Date;
        address: string | null;
        branchId: string | null;
        interface: string;
    }[]>;
    findOne(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        type: string;
        updatedAt: Date;
        address: string | null;
        branchId: string | null;
        interface: string;
    }>;
    update(id: string, tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        type: string;
        updatedAt: Date;
        address: string | null;
        branchId: string | null;
        interface: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        type: string;
        updatedAt: Date;
        address: string | null;
        branchId: string | null;
        interface: string;
    }>;
}
