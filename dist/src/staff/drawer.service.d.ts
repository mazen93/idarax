import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CloseDrawerDto, OpenDrawerDto, AddMovementDto } from './dto/drawer.dto';
export declare class DrawerService {
    private readonly prisma;
    private readonly tenantService;
    private readonly logger;
    constructor(prisma: PrismaService, tenantService: TenantService);
    openDrawer(userId: string, dto: OpenDrawerDto): Promise<any>;
    closeDrawer(userId: string, dto: CloseDrawerDto): Promise<any>;
    addMovement(userId: string, dto: AddMovementDto): Promise<any>;
    recordSale(tenantId: string, userId: string, amount: number, orderId: string): Promise<void>;
    recordSaleByTenant(tenantId: string, branchId: string | undefined, amount: number, orderId: string): Promise<void>;
    recordRefundByTenant(tenantId: string, branchId: string | undefined, amount: number, orderId: string): Promise<void>;
    recordRefund(tenantId: string, userId: string, amount: number, orderId: string): Promise<void>;
    hasOpenSession(tenantId: string, branchId: string | null | undefined, userId: string): Promise<boolean>;
    getCurrentSession(userId: string): Promise<any>;
    getReport(sessionId: string): Promise<any>;
    getHistory(from?: Date, to?: Date, branchId?: string): Promise<any>;
    private _requireOpenSession;
}
