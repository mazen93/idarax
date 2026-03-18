import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { SerialService } from './serial.service';
import { RegisterSerialDto, UpdateSerialStatusDto } from './dto/serial.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('retail/serials')
@UseGuards(JwtAuthGuard)
export class SerialController {
    constructor(private readonly serialService: SerialService) { }

    @Post('register')
    @Permissions(Actions.INVENTORY.CREATE)
    register(@Body() dto: RegisterSerialDto) {
        return this.serialService.register(dto);
    }

    @Get(':serial')
    @Permissions(Actions.INVENTORY.VIEW)
    findBySerial(@Param('serial') serial: string) {
        return this.serialService.findBySerial(serial);
    }

    @Patch(':id/status')
    @Permissions(Actions.INVENTORY.ADJUST)
    updateStatus(@Param('id') id: string, @Body() dto: UpdateSerialStatusDto) {
        return this.serialService.updateStatus(id, dto);
    }

    @Get('product/:productId')
    @Permissions(Actions.INVENTORY.VIEW)
    findByProduct(@Param('productId') productId: string) {
        return this.serialService.findByProduct(productId);
    }
}
