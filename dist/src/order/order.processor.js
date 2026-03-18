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
exports.OrderProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
const inventory_service_1 = require("../retail/inventory/inventory.service");
const tenant_service_1 = require("../tenant/tenant.service");
let OrderProcessor = class OrderProcessor {
    prisma;
    inventoryService;
    tenantService;
    constructor(prisma, inventoryService, tenantService) {
        this.prisma = prisma;
        this.inventoryService = inventoryService;
        this.tenantService = tenantService;
    }
    async handleCreateOrder(job) {
        const { orderData, items, tenantId, warehouseId } = job.data;
        this.tenantService.setContext(tenantId, orderData.branchId);
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    ...orderData,
                    items: {
                        create: items.map((item) => ({
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
            if (orderData.tableId) {
                const totalAmount = Number(orderData.totalAmount || 0);
                const paidAmount = Number(orderData.paidAmount || 0);
                const isFullyPaid = Math.round(paidAmount * 100) >= Math.round(totalAmount * 100);
                await tx.table.update({
                    where: { id: orderData.tableId },
                    data: { status: isFullyPaid ? 'AVAILABLE' : 'OCCUPIED' },
                });
            }
            if (warehouseId) {
                for (const item of items) {
                    await this.inventoryService.adjustStock({
                        productId: item.productId,
                        warehouseId: warehouseId,
                        quantity: -item.quantity,
                        type: 'SALE',
                        referenceId: order.id,
                    });
                }
            }
            return order;
        });
    }
};
exports.OrderProcessor = OrderProcessor;
__decorate([
    (0, bull_1.Process)('create-order'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderProcessor.prototype, "handleCreateOrder", null);
exports.OrderProcessor = OrderProcessor = __decorate([
    (0, bull_1.Processor)('orders'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        inventory_service_1.InventoryService,
        tenant_service_1.TenantService])
], OrderProcessor);
//# sourceMappingURL=order.processor.js.map