import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DrovoService {
    private readonly logger = new Logger(DrovoService.name);
    private readonly drovoApiUrl = process.env.DROVO_API_URL || 'http://127.0.0.1:3002';

    constructor(private prisma: PrismaService) {}

    /**
     * Dispatch an Idarax Order cleanly to the Drovo aggregator.
     */
    async dispatchOrder(orderId: string, tenantId: string) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId, tenantId },
                include: { 
                    tenant: { include: { settings: true } },
                    customer: true
                }
            });

            if (!order) return;

            // Don't dispatch non-delivery orders
            if (order.orderType !== 'DELIVERY') return;

            const settings = order.tenant?.settings;
            if (!settings?.drovoApiKey || !settings?.drovoTenantId) {
                this.logger.debug(`Tenant ${tenantId} missing Drovo credentials. Skipping dispatch.`);
                return;
            }

            // Map Idarax order to Drovo CreateOrderDto format
            const payload = {
                externalOrderId: order.id,
                customerName: order.customer?.name || order.guestName || 'Valued Customer',
                customerPhone: order.customer?.phone || order.guestPhone || '0000000000',
                deliveryAddress: order.deliveryAddress || 'Unknown Delivery Address',
                orderValue: Number(order.totalAmount),
                deliveryFee: Number(order.deliveryFee || 0),
                paymentType: order.paymentMethod === 'CASH' ? 'CASH' : 'PREPAID',
                pickupAddress: order.tenant.name + ' POS',
                dropoffInstructions: order.note
            };

            this.logger.debug(`Dispatching Order ${order.id} to Drovo. Customer: ${payload.customerName}, Fee: ${payload.deliveryFee}`);

            const response = await fetch(`${this.drovoApiUrl}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.drovoApiKey,
                    'tenant-id': settings.drovoTenantId // The controller usually reads tenantId from req using auth, but external-api reads x-api-key
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Failed to dispatch order ${order.id} to Drovo: [${response.status}] ${errorText}`);
                return;
            }

            const drovoOrder = await response.json();

            // Store Drovo mapping back to Idarax
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    externalOrderId: drovoOrder.trackingCode || drovoOrder.id,
                    externalPlatform: 'DROVO'
                }
            });

            this.logger.log(`Successfully dispatched Order ${order.id} to Drovo (${drovoOrder.id})`);
            return drovoOrder;
            
        } catch (error) {
            this.logger.error(`Error dispatching to Drovo: ${error.message}`, error.stack);
        }
    }

    async getDeliveryFeeEstimate(tenantId: string, address: string, lat?: number, lng?: number) {
        try {
            const settings = await this.prisma.settings.findFirst({
                where: { tenant: { id: tenantId } }
            });

            if (!settings?.drovoApiKey) return null;

            const response = await fetch(`${this.drovoApiUrl}/api/orders/estimate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.drovoApiKey
                },
                body: JSON.stringify({
                    deliveryAddress: address,
                    latitude: lat,
                    longitude: lng
                }),
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            this.logger.error(`Error getting Drovo estimate: ${error.message}`);
            return null;
        }
    }
}
