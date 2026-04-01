import { Controller, Get, Post, Body, Param, Query, Res, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PublicService } from './public.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';
import { InvoiceService } from '../order/invoice.service';
import type { Response } from 'express';

@ApiTags('Public Menu')
@Controller('public')
export class PublicController {
    constructor(
        private readonly publicService: PublicService,
        private readonly invoiceService: InvoiceService
    ) { }

    @Get('order/:id/invoice')
    @ApiOperation({ summary: 'Download order invoice as PDF (Public)' })
    async getOrderInvoice(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.invoiceService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('order/:id')
    @ApiOperation({ summary: 'Get order details for guests' })
    getPublicOrder(@Param('id') id: string) {
        return this.publicService.getPublicOrder(id);
    }

    @Get('tenant/:id')
    @ApiOperation({ summary: 'Get restaurant branding and settings' })
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(30000)
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
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(30000)
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
