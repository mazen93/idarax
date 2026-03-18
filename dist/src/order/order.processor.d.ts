import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../retail/inventory/inventory.service';
import { TenantService } from '../tenant/tenant.service';
export declare class OrderProcessor {
    private readonly prisma;
    private readonly inventoryService;
    private readonly tenantService;
    constructor(prisma: PrismaService, inventoryService: InventoryService, tenantService: TenantService);
    handleCreateOrder(job: Job<any>): Promise<any>;
}
