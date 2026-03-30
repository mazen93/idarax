import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { RequiresFeature } from '../../auth/subscription.decorator';
import { SubscriptionGuard } from '../../auth/subscription.guard';

@Controller('restaurant/tables')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresFeature('RESTAURANT')
export class TableController {
    constructor(private readonly tableService: TableService) { }

    @Post()
    @Permissions(Actions.TABLES.MANAGE)
    create(@Body() dto: CreateTableDto) {
        return this.tableService.create(dto);
    }

    @Get()
    @Permissions(Actions.TABLES.VIEW)
    findAll() {
        return this.tableService.findAll();
    }

    @Get(':id')
    @Permissions(Actions.TABLES.VIEW)
    findOne(@Param('id') id: string) {
        return this.tableService.findOne(id);
    }

    @Patch(':id')
    @Permissions(Actions.TABLES.MANAGE)
    update(@Param('id') id: string, @Body() dto: UpdateTableDto) {
        return this.tableService.update(id, dto);
    }

    @Post(':id/move-order')
    @Permissions(Actions.TABLES.TRANSFER)
    moveOrder(@Param('id') id: string, @Body('targetTableId') targetTableId: string) {
        return this.tableService.moveOrder(id, targetTableId); // Note: Here 'id' is actually orderId if we follow REST, but service expects orderId. I'll change service to take tableId or keep it consistent.
    }

    @Post(':id/merge')
    @Permissions(Actions.TABLES.MERGE)
    merge(@Param('id') id: string, @Body('targetTableId') targetTableId: string) {
        return this.tableService.mergeTables(id, targetTableId);
    }

    @Post(':id/unmerge')
    @Permissions(Actions.TABLES.MERGE)
    unmerge(@Param('id') id: string) {
        return this.tableService.unmergeTable(id);
    }

    @Post(':id/checkout')
    @Permissions(Actions.TABLES.MANAGE)
    checkout(@Param('id') id: string) {
        return this.tableService.checkout(id);
    }

    @Post('generate-qrcodes')
    @Permissions(Actions.TABLES.MANAGE)
    generateQRCodes() {
        return this.tableService.generateTableQRCodes();
    }

    @Delete(':id')
    @Permissions(Actions.TABLES.MANAGE)
    remove(@Param('id') id: string) {
        return this.tableService.remove(id);
    }
}
