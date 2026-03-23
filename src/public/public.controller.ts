import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';

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
    async getMenu(
        @Param('tenantId') tenantId: string,
        @Query('branchId') branchId?: string
    ) {
        const [tenant, categories] = await Promise.all([
            this.publicService.getTenantBranding(tenantId),
            this.publicService.getMenu(tenantId, branchId)
        ]);
        return { tenant, categories };
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

    @Get('table/:tableId/order')
    @ApiOperation({ summary: 'Get active order for a table (Public)' })
    getTableOrder(@Param('tableId') tableId: string) {
        return this.publicService.getTableOrder(tableId);
    }

    @Get('table/:id')
    @ApiOperation({ summary: 'Get table details (Public)' })
    getTable(@Param('id') id: string) {
        return this.publicService.getTable(id);
    }

    @Post('order/:orderId/split')
    @ApiOperation({ summary: 'Split an order (Public)' })
    splitOrder(@Param('orderId') id: string, @Body() dto: SplitBillDto) {
        // Reuse SplitBillDto from order module
        return this.publicService.splitOrder(id, dto);
    }
}
