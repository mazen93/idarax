import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('restaurant/printers')
@UseGuards(JwtAuthGuard)
export class PrinterController {
    constructor(private readonly printerService: PrinterService) { }

    @Post()
    @Permissions(Actions.SETTINGS.EDIT)
    create(@Request() req: any, @Body() data: any) {
        return this.printerService.create(req.user.tenantId, data);
    }

    @Get()
    @Permissions(Actions.SETTINGS.VIEW)
    findAll(@Request() req: any, @Query('branchId') branchId?: string) {
        return this.printerService.findAll(req.user.tenantId, branchId);
    }

    @Get(':id')
    @Permissions(Actions.SETTINGS.VIEW)
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.printerService.findOne(id, req.user.tenantId);
    }

    @Patch(':id')
    @Permissions(Actions.SETTINGS.EDIT)
    update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
        return this.printerService.update(id, req.user.tenantId, data);
    }

    @Delete(':id')
    @Permissions(Actions.SETTINGS.EDIT)
    remove(@Param('id') id: string, @Request() req: any) {
        return this.printerService.remove(id, req.user.tenantId);
    }
}
