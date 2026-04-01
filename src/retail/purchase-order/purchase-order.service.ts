import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderStatusDto, UpdatePurchaseOrderDto } from './dto/purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async create(dto: CreatePurchaseOrderDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const number = `PO-${Date.now()}`;

        return this.prisma.purchaseOrder.create({
            data: {
                number,
                vendorId: dto.vendorId,
                warehouseId: dto.warehouseId,
                branchId: dto.branchId,
                note: dto.note,
                tenantId,
                status: 'PENDING',
                items: {
                    create: dto.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        costPrice: item.costPrice
                    }))
                }
            },
            include: { items: true, vendor: true }
        });
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.purchaseOrder.findMany({
            where: { tenantId },
            include: { vendor: true, items: { include: { product: true } }, warehouse: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async update(id: string, dto: UpdatePurchaseOrderDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const po = await this.prisma.purchaseOrder.findUnique({ where: { id, tenantId } });
        if (!po) throw new NotFoundException('Purchase Order not found');

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                vendorId: dto.vendorId,
                warehouseId: dto.warehouseId,
                branchId: dto.branchId,
                note: dto.note,
                ...(dto.items && dto.items.length > 0 ? {
                    items: {
                        deleteMany: {},
                        create: dto.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            costPrice: item.costPrice
                        }))
                    }
                } : {})
            },
            include: { items: true, vendor: true, warehouse: true }
        });
    }

    async updateStatus(id: string, dto: UpdatePurchaseOrderStatusDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id, tenantId },
            include: { items: true }
        });

        if (!po) throw new NotFoundException('Purchase Order not found');

        // If status is becoming RECEIVED, we update stock
        if (dto.status === 'RECEIVED' && po.status !== 'RECEIVED') {
            await this.receiveOrder(po, dto.receivedItems);
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: dto.status,
                receivedAt: dto.status === 'RECEIVED' ? new Date() : undefined,
                orderedAt: dto.status === 'ORDERED' ? new Date() : undefined
            }
        });
    }

    private async receiveOrder(po: any, receivedItems?: { productId: string; quantity: number }[]) {
        if (!po.warehouseId) return; // Need a warehouse to receive stock

        const itemsToProcess = receivedItems && receivedItems.length > 0
            ? receivedItems
            : po.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity }));

        for (const item of itemsToProcess) {
            // Update received Qty in PO Item
            await this.prisma.purchaseOrderItem.update({
                where: { purchaseOrderId_productId: { purchaseOrderId: po.id, productId: item.productId } },
                data: { receivedQty: item.quantity }
            });

            // Update Stock Level
            await this.prisma.stockLevel.upsert({
                where: { productId_warehouseId: { productId: item.productId, warehouseId: po.warehouseId } },
                create: {
                    productId: item.productId,
                    warehouseId: po.warehouseId,
                    quantity: item.quantity
                },
                update: {
                    quantity: { increment: item.quantity }
                }
            });

            // Log Stock Movement
            await this.prisma.stockMovement.create({
                data: {
                    tenantId: po.tenantId,
                    productId: item.productId,
                    warehouseId: po.warehouseId,
                    quantity: item.quantity,
                    type: 'RESTOCK',
                    referenceId: `PO-${po.number}`
                }
            });
        }
    }
}
