import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards, Query } from '@nestjs/common';
import { PosDeviceService } from './pos-device.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/pos-device.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Permissions } from '../../auth/permissions.decorator';

@ApiTags('POS Devices')
@Controller('staff/pos-devices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PosDeviceController {
    constructor(private readonly posDeviceService: PosDeviceService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register or update a POS device' })
    async register(@Body() dto: RegisterDeviceDto) {
        return this.posDeviceService.register(dto);
    }

    @Get('validate')
    @ApiOperation({ summary: 'Validate if a device is authorized' })
    async validate(@Query('deviceId') deviceId: string) {
        return this.posDeviceService.validate(deviceId);
    }

    @Get()
    @Permissions('SETTINGS:READ')
    @ApiOperation({ summary: 'Get all registered devices for tenant' })
    async getDevices() {
        return this.posDeviceService.getDevices();
    }

    @Patch(':id')
    @Permissions('SETTINGS:WRITE')
    @ApiOperation({ summary: 'Update device settings' })
    async update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
        return this.posDeviceService.update(id, dto);
    }

    @Delete(':id')
    @Permissions('SETTINGS:WRITE')
    @ApiOperation({ summary: 'Deactivate a device' })
    async deactivate(@Param('id') id: string) {
        return this.posDeviceService.deactivate(id);
    }
}
