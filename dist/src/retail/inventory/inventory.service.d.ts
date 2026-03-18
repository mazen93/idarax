import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateWarehouseDto, AdjustStockDto, StocktakeDto } from './dto/inventory.dto';
import { KdsGateway } from '../../restaurant/kds/kds.gateway';
export declare class InventoryService {
    private prisma;
    private tenantService;
    private kdsGateway;
    constructor(prisma: PrismaService, tenantService: TenantService, kdsGateway: KdsGateway);
    createWarehouse(dto: CreateWarehouseDto): Promise<any>;
    getWarehouses(): Promise<any>;
    adjustStock(dto: AdjustStockDto): Promise<any>;
    getProductStock(productId: string): Promise<any>;
    getStockMovements(): Promise<any>;
    performStocktake(dto: StocktakeDto): Promise<any>;
}
