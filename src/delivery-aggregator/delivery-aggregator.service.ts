import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryAggregatorService {
    constructor(
        private orderService: OrderService,
        private prisma: PrismaService,
    ) {}

    async handleWebhook(platform: string, payload: any) {
        // 1. Identify Tenant and Branch (usually from webhook header or payload)
        // For simulation, we'll use a placeholder or the first tenant/branch
        const tenantId = payload.tenantId; 
        const branchId = payload.branchId;

        // 2. Map items from payload to internal SKUs
        const items = await Promise.all(payload.items.map(async (item: any) => {
            const product = await (this.prisma.client as any).product.findFirst({
                where: { 
                    OR: [
                        { sku: item.sku },
                        { name: item.name }
                    ]
                }
            });

            if (!product) throw new NotFoundException(`Product not found: ${item.sku || item.name}`);

            return {
                productId: product.id,
                quantity: item.quantity,
                price: item.price,
                note: `[${platform.toUpperCase()}] ${item.note || ''}`
            };
        }));

        // 3. Create Order
        return this.orderService.createDirect({
            tableId: undefined,
            customerId: undefined,
            items,
            totalAmount: payload.totalAmount,
            orderType: 'DELIVERY' as any,
            source: 'DELIVERY_PARTNER' as any,
            externalPlatform: platform.toUpperCase(),
            externalOrderId: payload.orderId,
            status: 'PREPARING', // Automatically fire to kitchen
            guestName: payload.customer?.name,
            guestPhone: payload.customer?.phone,
            deliveryAddress: payload.customer?.address,
            paymentMethod: 'EXTERNAL',
            paidAmount: payload.totalAmount, // Assuming prepaid by delivery partner
        } as any);
    }
}
