import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { DrawerService } from '../staff/drawer.service';
import { Optional } from '@nestjs/common';

@Injectable()
export class RefundService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        @Optional() private drawerService?: DrawerService,
    ) { }

    async refundOrder(orderId: string, reason?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma as any).$transaction(async (tx: any) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            if (!order || order.tenantId !== tenantId) {
                throw new NotFoundException('Order not found');
            }

            if (order.status !== 'COMPLETED') {
                throw new BadRequestException('Only completed (fully paid) orders can be refunded');
            }

            // 1. Create Refund record
            const refund = await tx.refund.create({
                data: {
                    orderId,
                    amount: order.paidAmount,
                    reason: reason || 'Full Order Refund',
                    paymentMethod: order.paymentMethod,
                },
            });

            // 2. Mark order and items as REFUNDED
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'REFUNDED' },
            });

            await tx.orderItem.updateMany({
                where: { orderId, status: { not: 'REFUNDED' } },
                data: { status: 'REFUNDED' },
            });

            // 3. Restore stock for all items
            for (const item of order.items) {
                if (item.status !== 'REFUNDED') {
                    await this.restoreStockRecursively(tx, tenantId, branchId, item.productId, item.quantity, orderId);
                }
            }

            // 4. Record refund in cash drawer if it was a cash order
            if ((order.paymentMethod === 'CASH' || !order.paymentMethod) && this.drawerService) {
                await this.drawerService.recordRefundByTenant(tenantId, branchId ?? undefined, Number(order.paidAmount), orderId);
            }

            return refund;
        });
    }

    async refundItem(itemId: string, quantity: number, reason?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma as any).$transaction(async (tx: any) => {
            const item = await tx.orderItem.findUnique({
                where: { id: itemId },
                include: { order: true },
            });

            if (!item || item.order.tenantId !== tenantId) {
                throw new NotFoundException('Order item not found');
            }

            if (item.order.status !== 'COMPLETED') {
                throw new BadRequestException('Only items from completed (fully paid) orders can be refunded');
            }

            if (quantity > item.quantity) {
                throw new BadRequestException('Refund quantity exceeds original quantity');
            }

            const refundAmount = Number(item.price) * quantity;

            // 1. Create or update Refund record for this order
            let refund = await tx.refund.findFirst({
                where: { orderId: item.orderId, reason: reason || 'Partial Item Refund' }
            });

            if (!refund) {
                refund = await tx.refund.create({
                    data: {
                        orderId: item.orderId,
                        amount: refundAmount,
                        reason: reason || 'Partial Item Refund',
                        paymentMethod: item.order.paymentMethod,
                    }
                });
            } else {
                await tx.refund.update({
                    where: { id: refund.id },
                    data: { amount: { increment: refundAmount } }
                });
            }

            // 2. Create RefundItem
            await tx.refundItem.create({
                data: {
                    refundId: refund.id,
                    orderItemId: itemId,
                    quantity,
                    amount: refundAmount
                }
            });

            // 3. Update OrderItem status if fully refunded
            if (quantity === item.quantity) {
                await tx.orderItem.update({
                    where: { id: itemId },
                    data: { status: 'REFUNDED' }
                });
            }

            // 4. Update Order paidAmount (decrement)
            await tx.order.update({
                where: { id: item.orderId },
                data: { paidAmount: { decrement: refundAmount } }
            });

            // 5. Restore stock
            await this.restoreStockRecursively(tx, tenantId, branchId, item.productId, quantity, item.orderId);

            // 6. Record refund in cash drawer if it was a cash order
            if ((item.order.paymentMethod === 'CASH' || !item.order.paymentMethod) && this.drawerService) {
                await this.drawerService.recordRefundByTenant(tenantId, branchId ?? undefined, refundAmount, item.orderId);
            }

            return refund;
        });
    }

    private async restoreStockRecursively(tx: any, tenantId: string, branchId: string | undefined, productId: string, quantity: number, orderId: string) {
        const product = await tx.product.findUnique({
            where: { id: productId },
            select: { productType: true }
        });

        const recipe = await tx.productRecipe.findMany({
            where: { parentId: productId },
        });

        if (recipe && recipe.length > 0 && (product?.productType === 'STANDARD' || product?.productType === 'COMBO')) {
            for (const component of recipe) {
                const componentQuantity = Number(component.quantity) * quantity;
                await this.restoreStockRecursively(tx, tenantId, branchId, component.ingredientId, componentQuantity, orderId);
            }
        } else {
            const stockLevel = await tx.stockLevel.findFirst({
                where: {
                    productId: productId,
                    warehouse: {
                        tenantId,
                        ...(branchId ? { branchId } : {})
                    },
                },
            });

            if (stockLevel) {
                await tx.stockLevel.update({
                    where: { id: stockLevel.id },
                    data: { quantity: { increment: quantity } },
                });

                await tx.stockMovement.create({
                    data: {
                        productId: productId,
                        warehouseId: stockLevel.warehouseId,
                        quantity: quantity,
                        type: 'RETURN',
                        referenceId: orderId,
                        tenantId,
                    },
                });
            }
        }
    }
}
