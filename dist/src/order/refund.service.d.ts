import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { DrawerService } from '../staff/drawer.service';
export declare class RefundService {
    private prisma;
    private tenantService;
    private drawerService?;
    constructor(prisma: PrismaService, tenantService: TenantService, drawerService?: DrawerService | undefined);
    refundOrder(orderId: string, reason?: string): Promise<any>;
    refundItem(itemId: string, quantity: number, reason?: string): Promise<any>;
    private restoreStockRecursively;
}
