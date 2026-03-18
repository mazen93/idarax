import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto, UpdateTransferStatusDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('retail/transfers')
@UseGuards(JwtAuthGuard)
export class TransferController {
    constructor(private readonly transferService: TransferService) { }

    @Post()
    @Permissions(Actions.INVENTORY.TRANSFER)
    create(@Body() dto: CreateTransferDto) {
        return this.transferService.create(dto);
    }

    @Get()
    @Permissions(Actions.INVENTORY.VIEW)
    findAll() {
        return this.transferService.findAll();
    }

    @Patch(':id/status')
    @Permissions(Actions.INVENTORY.TRANSFER)
    updateStatus(@Param('id') id: string, @Body() dto: UpdateTransferStatusDto) {
        return this.transferService.updateStatus(id, dto);
    }
}
