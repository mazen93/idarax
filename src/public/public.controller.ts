import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePublicOrderDto } from './dto/public.dto';

@ApiTags('Public Menu')
@Controller('public')
export class PublicController {
    constructor(private readonly publicService: PublicService) { }

    @Get('tenant/:id')
    @ApiOperation({ summary: 'Get restaurant branding and settings' })
    getTenant(@Param('id') id: string) {
        return this.publicService.getTenantBranding(id);
    }

    @Get('tenant/:id/branches')
    @ApiOperation({ summary: 'Get active branches for a restaurant' })
    getBranches(@Param('id') id: string) {
        return this.publicService.getBranches(id);
    }

    @Get('menu/:tenantId')
    @ApiOperation({ summary: 'Get public menu categories and products' })
    getMenu(
        @Param('tenantId') tenantId: string,
        @Query('branchId') branchId?: string
    ) {
        return this.publicService.getMenu(tenantId, branchId);
    }

    @Post('order/:tenantId')
    @ApiOperation({ summary: 'Create a new guest order' })
    createOrder(@Param('tenantId') tenantId: string, @Body() dto: CreatePublicOrderDto) {
        return this.publicService.createGuestOrder(tenantId, dto);
    }

    @Get('qr/:tenantId/:tableId')
    @ApiOperation({ summary: 'Generate QR code for a specific table' })
    generateQr(@Param('tenantId') tenantId: string, @Param('tableId') tableId: string) {
        return this.publicService.generateTableQr(tenantId, tableId);
    }

    @Post('order/:id/feedback')
    @ApiOperation({ summary: 'Submit feedback for an order' })
    createFeedback(@Param('id') id: string, @Body() dto: { rating: number, comment?: string }) {
        return this.publicService.createOrderFeedback(id, dto);
    }
}
