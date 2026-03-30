import { PrinterService } from './printer.service';
export declare class PrinterController {
    private readonly printerService;
    constructor(printerService: PrinterService);
    create(req: any, data: any): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        type: string;
        address: string | null;
        interface: string;
    }>;
    findAll(req: any, branchId?: string): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        type: string;
        address: string | null;
        interface: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        type: string;
        address: string | null;
        interface: string;
    }>;
    update(id: string, req: any, data: any): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        type: string;
        address: string | null;
        interface: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        branchId: string | null;
        type: string;
        address: string | null;
        interface: string;
    }>;
}
