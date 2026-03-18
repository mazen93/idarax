import { InventoryService } from './inventory.service';
import { CreateWarehouseDto, AdjustStockDto, StocktakeDto } from './dto/inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    createWarehouse(dto: CreateWarehouseDto): Promise<any>;
    getWarehouses(): Promise<any>;
    adjustStock(dto: AdjustStockDto): Promise<any>;
    performStocktake(dto: StocktakeDto): Promise<any>;
    getMovements(): Promise<any>;
    getProductStock(productId: string): Promise<any>;
}
