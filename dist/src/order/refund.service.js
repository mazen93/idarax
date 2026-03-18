"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
const drawer_service_1 = require("../staff/drawer.service");
const common_2 = require("@nestjs/common");
let RefundService = class RefundService {
    prisma;
    tenantService;
    drawerService;
    constructor(prisma, tenantService, drawerService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.drawerService = drawerService;
    }
    async refundOrder(orderId, reason) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });
            if (!order || order.tenantId !== tenantId) {
                throw new common_1.NotFoundException('Order not found');
            }
            if (order.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('Only completed (fully paid) orders can be refunded');
            }
            const refund = await tx.refund.create({
                data: {
                    orderId,
                    amount: order.paidAmount,
                    reason: reason || 'Full Order Refund',
                    paymentMethod: order.paymentMethod,
                },
            });
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'REFUNDED' },
            });
            await tx.orderItem.updateMany({
                where: { orderId, status: { not: 'REFUNDED' } },
                data: { status: 'REFUNDED' },
            });
            for (const item of order.items) {
                if (item.status !== 'REFUNDED') {
                    await this.restoreStockRecursively(tx, tenantId, branchId, item.productId, item.quantity, orderId);
                }
            }
            if ((order.paymentMethod === 'CASH' || !order.paymentMethod) && this.drawerService) {
                await this.drawerService.recordRefundByTenant(tenantId, branchId ?? undefined, Number(order.paidAmount), orderId);
            }
            return refund;
        });
    }
    async refundItem(itemId, quantity, reason) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.$transaction(async (tx) => {
            const item = await tx.orderItem.findUnique({
                where: { id: itemId },
                include: { order: true },
            });
            if (!item || item.order.tenantId !== tenantId) {
                throw new common_1.NotFoundException('Order item not found');
            }
            if (item.order.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('Only items from completed (fully paid) orders can be refunded');
            }
            if (quantity > item.quantity) {
                throw new common_1.BadRequestException('Refund quantity exceeds original quantity');
            }
            const refundAmount = Number(item.price) * quantity;
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
            }
            else {
                await tx.refund.update({
                    where: { id: refund.id },
                    data: { amount: { increment: refundAmount } }
                });
            }
            await tx.refundItem.create({
                data: {
                    refundId: refund.id,
                    orderItemId: itemId,
                    quantity,
                    amount: refundAmount
                }
            });
            if (quantity === item.quantity) {
                await tx.orderItem.update({
                    where: { id: itemId },
                    data: { status: 'REFUNDED' }
                });
            }
            await tx.order.update({
                where: { id: item.orderId },
                data: { paidAmount: { decrement: refundAmount } }
            });
            await this.restoreStockRecursively(tx, tenantId, branchId, item.productId, quantity, item.orderId);
            if ((item.order.paymentMethod === 'CASH' || !item.order.paymentMethod) && this.drawerService) {
                await this.drawerService.recordRefundByTenant(tenantId, branchId ?? undefined, refundAmount, item.orderId);
            }
            return refund;
        });
    }
    async restoreStockRecursively(tx, tenantId, branchId, productId, quantity, orderId) {
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
        }
        else {
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
};
exports.RefundService = RefundService;
exports.RefundService = RefundService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_2.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        drawer_service_1.DrawerService])
], RefundService);
//# sourceMappingURL=refund.service.js.map