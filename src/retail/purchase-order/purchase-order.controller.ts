import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto } from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('retail/purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrderController {
    constructor(private readonly poService: PurchaseOrderService) { }

    @Post()
    @Permissions(Actions.INVENTORY.CREATE)
    create(@Body() dto: CreatePurchaseOrderDto) {
        return this.poService.create(dto);
    }

    @Get()
    @Permissions(Actions.INVENTORY.VIEW)
    findAll() {
        return this.poService.findAll();
    }

    @Patch(':id/status')
    @Permissions(Actions.INVENTORY.ADJUST)
    updateStatus(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderStatusDto) {
        return this.poService.updateStatus(id, dto);
    }
}
