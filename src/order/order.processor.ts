import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../retail/inventory/inventory.service';
import { TenantService } from '../tenant/tenant.service';

@Processor('orders')
export class OrderProcessor {
    constructor(
        private readonly prisma: PrismaService,
        private readonly inventoryService: InventoryService,
        private readonly tenantService: TenantService,
    ) { }

    @Process('create-order')
    async handleCreateOrder(job: Job<any>) {
        const { orderData, items, tenantId, warehouseId } = job.data;
        this.tenantService.setContext(tenantId, orderData.branchId);

        return (this.prisma as any).$transaction(async (tx: any) => {
            // 1. Create the order
            const order = await tx.order.create({
                data: {
                    ...orderData,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            stationId: item.stationId,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            // 1.5 Update table status conditional on payment
            if (orderData.tableId) {
                const totalAmount = Number(orderData.totalAmount || 0);
                const paidAmount = Number(orderData.paidAmount || 0);
                const isFullyPaid = Math.round(paidAmount * 100) >= Math.round(totalAmount * 100);

                await tx.table.update({
                    where: { id: orderData.tableId },
                    data: { status: isFullyPaid ? 'AVAILABLE' : 'OCCUPIED' },
                });
            }

            // 2. Deduct stock for each item if a warehouse is specified
            if (warehouseId) {
                for (const item of items) {
                    await this.inventoryService.adjustStock({
                        productId: item.productId,
                        warehouseId: warehouseId,
                        quantity: -item.quantity, // Negative for deduction
                        type: 'SALE',
                        referenceId: order.id,
                    });
                }
            }

            return order;
        });
    }
}
