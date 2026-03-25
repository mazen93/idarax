import { Controller, Post, Body, Headers, Logger, Param, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';
import { OrderStatus } from '@prisma/client';

@Controller('delivery-aggregator/drovo')
export class DrovoController {
    private readonly logger = new Logger(DrovoController.name);

    constructor(
        private prisma: PrismaService
    ) {}

    @Post('webhook/:tenantId')
    async handleWebhook(
        @Param('tenantId') tenantId: string,
        @Headers('x-drovo-signature') signature: string,
        @Body() payload: any,
        @Req() req: Request
    ) {
        this.logger.log(`Received Drovo webhook for tenant ${tenantId}`);
        
        // 1. Validate Secret & Find Tenant
        const settings = await this.prisma.settings.findUnique({
            where: { tenantId }
        });

        // 2. Parse Payload
        const { event, data } = payload;
        
        if (event !== 'ORDER_STATUS_CHANGED' || !data) {
            return { received: true };
        }

        const idaraxOrderId = data.externalOrderId;
        const drovoStatus = data.status;

        if (!idaraxOrderId) {
            this.logger.warn(`Drovo webhook order missing externalOrderId`);
            return { received: true };
        }

        // 3. Map Drovo Status to Idarax Status
        let newStatus: OrderStatus | null = null;
        switch (drovoStatus) {
            case 'PENDING':
                newStatus = OrderStatus.PREPARING;
                break;
            case 'ASSIGNED':
            case 'ACCEPTED':
            case 'ARRIVED_PICKUP':
            case 'PICKED_UP':
                newStatus = OrderStatus.READY; // Or 'DISPATCHED' if Idarax had it
                break;
            case 'IN_TRANSIT':
                newStatus = OrderStatus.COMPLETED; // Depends on definitions, usually DELIVERED or COMPLETED
                break;
            case 'DELIVERED':
                newStatus = OrderStatus.COMPLETED;
                break;
            case 'CANCELLED':
            case 'CANCELLED_BY_CUSTOMER':
            case 'REJECTED':
            case 'FAILED':
                newStatus = OrderStatus.CANCELLED;
                break;
            default:
                break;
        }

        if (newStatus) {
            await this.prisma.order.update({
                where: { id: idaraxOrderId },
                data: {
                    status: newStatus,
                    externalOrderId: data.trackingCode || data.id, 
                    // Optional: store driver details or tracking
                    note: data.driver ? `Driver: ${data.driver.name} - ${data.driver.phone}` : undefined
                }
            }).catch(e => {
                this.logger.error(`Failed to update order status from Drovo webhook for ${idaraxOrderId}: ${e.message}`);
            });
            this.logger.log(`Mapped Drovo ${drovoStatus} -> Idarax ${newStatus} for Order ${idaraxOrderId}`);
        }

        return { received: true };
    }
}
