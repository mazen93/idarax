import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { ProcessPaymentDto, PaymentStatusDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async processPayment(dto: ProcessPaymentDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Simulate Payment Gateway logic
        const status = Math.random() > 0.1 ? 'COMPLETED' : 'FAILED';
        const reference = `MOCK_REF_${Math.random().toString(36).substring(7).toUpperCase()}`;

        const payment = await (this.prisma as any).payment.create({
            data: {
                orderId: dto.orderId,
                amount: dto.amount,
                method: dto.method,
                status: status,
                reference: reference,
            },
        });

        if (status === 'COMPLETED') {
            const order = await (this.prisma as any).order.findUnique({
                where: { id: dto.orderId },
                select: { tableId: true },
            });

            if (order?.tableId) {
                await (this.prisma as any).table.update({
                    where: { id: order.tableId },
                    data: { status: 'AVAILABLE' },
                });
            }
        }

        return payment;
    }

    async getPaymentsByOrder(orderId: string) {
        return (this.prisma as any).payment.findMany({
            where: { orderId },
        });
    }

    async updatePaymentStatus(id: string, dto: PaymentStatusDto) {
        return (this.prisma as any).payment.update({
            where: { id },
            data: { status: dto.status },
        });
    }
}
