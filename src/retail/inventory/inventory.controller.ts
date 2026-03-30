import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateWarehouseDto, AdjustStockDto, StocktakeDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { RequiresFeature } from '../../auth/subscription.decorator';
import { SubscriptionGuard } from '../../auth/subscription.guard';

@Controller('retail/inventory')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresFeature('INVENTORY')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post('warehouses')
    @Permissions(Actions.INVENTORY.CREATE)
    createWarehouse(@Body() dto: CreateWarehouseDto) {
        return this.inventoryService.createWarehouse(dto);
    }

    @Get('warehouses')
    @Permissions(Actions.INVENTORY.VIEW)
    getWarehouses() {
        return this.inventoryService.getWarehouses();
    }

    @Post('adjust')
    @Permissions(Actions.INVENTORY.ADJUST)
    adjustStock(@Body() dto: AdjustStockDto) {
        return this.inventoryService.adjustStock(dto);
    }

    @Post('stocktake')
    @Permissions(Actions.INVENTORY.ADJUST)
    performStocktake(@Body() dto: StocktakeDto) {
        return this.inventoryService.performStocktake(dto);
    }

    @Get('movements')
    @Permissions(Actions.INVENTORY.VIEW)
    getMovements() {
        return this.inventoryService.getStockMovements();
    }

    @Get('stock/:productId')
    @Permissions(Actions.INVENTORY.VIEW)
    getProductStock(@Param('productId') productId: string) {
        return this.inventoryService.getProductStock(productId);
    }
}
