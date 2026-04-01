import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req, Query, Res } from '@nestjs/common';
import { OrderService } from './order.service';
import { RefundService } from './refund.service';
import { InvoiceService } from './invoice.service';
import type { Response } from 'express';
import { CreateOrderDto, SplitBillDto, RepeatOrderDto, SendReceiptDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
    constructor(
        private readonly orderService: OrderService,
        private readonly refundService: RefundService,
        private readonly invoiceService: InvoiceService,
    ) { }

    @Get(':id/invoice')
    @Permissions('orders:read')
    async getOrderInvoice(@Param('id') id: string, @Res() res: Response) {
        const buffer = await this.invoiceService.generateInvoicePdf(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Post()
    @Permissions(Actions.ORDERS.CREATE)
    create(@Req() req: any, @Body() dto: CreateOrderDto) {
        return this.orderService.createAsync(dto, req.user.id);
    }

    @Get()
    @Permissions(Actions.ORDERS.VIEW_ALL)
    @ApiOperation({ summary: 'List all orders for the tenant' })
    findAll(
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('status') status?: string,
        @Query('limit') limit?: string,
    ) {
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (start) {
            const d = new Date(start);
            if (!isNaN(d.getTime())) startDate = d;
        }

        if (end) {
            const d = new Date(end);
            if (!isNaN(d.getTime())) {
                d.setUTCHours(23, 59, 59, 999);
                endDate = d;
            }
        }

        return this.orderService.findAll(startDate, endDate, status, limit ? parseInt(limit, 10) : undefined);
    }

    @Get('lookup')
    @Permissions(Actions.ORDERS.VIEW)
    @ApiOperation({ summary: 'Find an order by receipt number + business date + branch (for reprint / audit)' })
    lookupByReceipt(
        @Query('receiptNumber') receiptNumber: string,
        @Query('date') date: string,
        @Query('branchId') branchId?: string,
    ) {
        return this.orderService.lookupByReceipt(Number(receiptNumber), date, branchId);
    }

    @Post('direct')
    @Permissions(Actions.ORDERS.CREATE)
    @ApiOperation({ summary: 'Create order synchronously (POS / cashier flow)' })
    createDirect(@Req() req: any, @Body() dto: CreateOrderDto) {
        return this.orderService.createDirect({ ...dto, userId: req.user.id });
    }

    @Patch(':id/status')
    @Permissions(Actions.ORDERS.CREATE) // Or POS access
    @ApiOperation({ summary: 'Update order status (KDS actions)' })
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.orderService.updateStatus(id, body.status);
    }

    @Patch(':id/table')
    @Permissions(Actions.TABLES.MANAGE)
    @ApiOperation({ summary: 'Assign order to a table' })
    assignTable(@Param('id') id: string, @Body() body: { tableId: string }) {
        return this.orderService.assignTable(id, body.tableId);
    }

    @Get('table/:tableId/active')
    @Permissions(Actions.ORDERS.VIEW) // Used by Cashier/Waitstaff
    @ApiOperation({ summary: 'Get active order for a table' })
    findActiveByTable(@Param('tableId') tableId: string) {
        return this.orderService.findActiveByTable(tableId);
    }

    @Post('split')
    @Permissions(Actions.ORDERS.CREATE)
    @ApiOperation({ summary: 'Split an existing order into multiple sub-orders' })
    split(@Body() dto: SplitBillDto) {
        return this.orderService.splitBill(dto);
    }

    @Get(':id')
    @Permissions(Actions.ORDERS.VIEW)
    findOne(@Param('id') id: string) {
        return this.orderService.getOrder(id);
    }

    @Post(':id/refund')
    @Permissions(Actions.ORDERS.REFUND)
    @ApiOperation({ summary: 'Refund entire order' })
    refundOrder(@Param('id') id: string, @Body() body: { reason?: string }) {
        return this.refundService.refundOrder(id, body.reason);
    }

    @Post(':id/items/:itemId/refund')
    @Permissions(Actions.ORDERS.REFUND)
    @ApiOperation({ summary: 'Refund specific order item' })
    refundItem(
        @Param('id') id: string,
        @Param('itemId') itemId: string,
        @Body() body: { quantity: number; reason?: string }
    ) {
        return this.refundService.refundItem(itemId, body.quantity, body.reason);
    }

    @Patch(':id/hold')
    @Permissions(Actions.ORDERS.CREATE) // Holding is often standard POS access
    @ApiOperation({ summary: 'Park order (PENDING -> HELD)' })
    holdOrder(@Param('id') id: string) {
        return this.orderService.holdOrder(id);
    }

    @Patch(':id/fire')
    @Permissions(Actions.ORDERS.CREATE)
    @ApiOperation({ summary: 'Send held order to kitchen (HELD -> PREPARING)' })
    fireOrder(@Param('id') id: string) {
        return this.orderService.fireOrder(id);
    }

    @Patch(':id/void')
    @Permissions(Actions.ORDERS.CANCEL)
    @ApiOperation({ summary: 'Cancel order with manager PIN authorization' })
    voidOrder(@Param('id') id: string, @Body() body: { managerPin: string }) {
        return this.orderService.voidOrder(id, body.managerPin);
    }

    @Patch(':id/void-item/:itemId')
    @Permissions(Actions.ORDERS.CANCEL)
    @ApiOperation({ summary: 'Void a single specific item' })
    voidItem(@Param('id') id: string, @Param('itemId') itemId: string) {
        return this.orderService.voidItem(id, itemId);
    }

    @Post(':id/repeat')
    @Permissions(Actions.ORDERS.CREATE)
    @ApiOperation({ summary: 'Clone a previous order' })
    repeatOrder(@Param('id') id: string) {
        return this.orderService.repeatOrder({ orderId: id });
    }

    @Post(':id/receipt')
    @Permissions(Actions.ORDERS.VIEW)
    @ApiOperation({ summary: 'Send order receipt to email' })
    sendReceipt(@Param('id') id: string, @Body() dto: SendReceiptDto) {
        return this.orderService.sendReceipt(id, dto.email);
    }
}
