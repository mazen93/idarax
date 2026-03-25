import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateWarehouseDto, AdjustStockDto, StocktakeDto } from './dto/inventory.dto';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class InventoryService {
    private prisma;
    private tenantService;
    private notificationsService;
    constructor(prisma: PrismaService, tenantService: TenantService, notificationsService: NotificationsService);
    createWarehouse(dto: CreateWarehouseDto): Promise<any>;
    getWarehouses(): Promise<any>;
    adjustStock(dto: AdjustStockDto): Promise<any>;
    getProductStock(productId: string): Promise<any>;
    getStockMovements(): Promise<any>;
    performStocktake(dto: StocktakeDto): Promise<any>;
}
