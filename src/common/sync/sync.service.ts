import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  async processSyncBatch(tenantId: string, branchId: string, orders: any[]) {
    this.logger.log(`Processing offline sync batch for tenant ${tenantId}, branch ${branchId}. Orders: ${orders.length}`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const orderData of orders) {
      try {
        // Idempotency: skip if order with this external ID already exists
        if (orderData.id) {
            const existing = await this.prisma.order.findUnique({
                where: { id: orderData.id }
            });
            if (existing) {
                results.success++;
                continue;
            }
        }

        // Basic order creation logic (simplified)
        await this.prisma.order.create({
          data: {
            ...orderData,
            tenantId,
            branchId,
            source: 'POS',
            status: orderData.status || 'COMPLETED',
            items: {
              create: orderData.items?.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                variantId: item.variantId,
                note: item.note
              }))
            }
          }
        });
        results.success++;
      } catch (error) {
        this.logger.error(`Sync failure for order ${orderData.id}: ${error.message}`);
        results.failed++;
        results.errors.push({ id: orderData.id, error: error.message });
      }
    }

    return results;
  }
}
