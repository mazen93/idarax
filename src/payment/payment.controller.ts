import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto, PaymentStatusDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('process')
    process(@Body() dto: ProcessPaymentDto) {
        return this.paymentService.processPayment(dto);
    }

    @Get('order/:orderId')
    findByOrder(@Param('orderId') orderId: string) {
        return this.paymentService.getPaymentsByOrder(orderId);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() dto: PaymentStatusDto) {
        return this.paymentService.updatePaymentStatus(id, dto);
    }
}
