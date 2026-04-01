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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let PurchaseOrderService = class PurchaseOrderService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
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
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.purchaseOrder.findMany({
            where: { tenantId },
            include: { vendor: true, items: { include: { product: true } }, warehouse: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const po = await this.prisma.purchaseOrder.findUnique({ where: { id, tenantId } });
        if (!po)
            throw new common_1.NotFoundException('Purchase Order not found');
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
    async updateStatus(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id, tenantId },
            include: { items: true }
        });
        if (!po)
            throw new common_1.NotFoundException('Purchase Order not found');
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
    async receiveOrder(po, receivedItems) {
        if (!po.warehouseId)
            return;
        const itemsToProcess = receivedItems && receivedItems.length > 0
            ? receivedItems
            : po.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
        for (const item of itemsToProcess) {
            await this.prisma.purchaseOrderItem.update({
                where: { purchaseOrderId_productId: { purchaseOrderId: po.id, productId: item.productId } },
                data: { receivedQty: item.quantity }
            });
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
};
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], PurchaseOrderService);
//# sourceMappingURL=purchase-order.service.js.map