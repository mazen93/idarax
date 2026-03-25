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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
const notifications_service_1 = require("../../notifications/notifications.service");
const notifications_dto_1 = require("../../notifications/dto/notifications.dto");
let InventoryService = class InventoryService {
    prisma;
    tenantService;
    notificationsService;
    constructor(prisma, tenantService, notificationsService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.notificationsService = notificationsService;
    }
    async createWarehouse(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.warehouse.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }
    async getWarehouses() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.warehouse.findMany({
            where: { tenantId },
        });
    }
    async adjustStock(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const movementTypeMap = {
            ADD: 'RESTOCK',
            REMOVE: 'ADJUSTMENT',
            SET: 'ADJUSTMENT',
            RESTOCK: 'RESTOCK',
            ADJUSTMENT: 'ADJUSTMENT',
            DAMAGE: 'DAMAGE',
            RETURN: 'RETURN',
            SALE: 'SALE',
        };
        const prismaType = 'ADJUSTMENT';
        return this.prisma.$transaction(async (tx) => {
            let deltaQuantity = dto.quantity;
            let updateClause;
            if (dto.type === 'REMOVE') {
                deltaQuantity = -Math.abs(dto.quantity);
                updateClause = { quantity: { decrement: Math.abs(dto.quantity) } };
            }
            else if (dto.type === 'SET') {
                updateClause = { quantity: dto.quantity };
            }
            else {
                deltaQuantity = Math.abs(dto.quantity);
                updateClause = { quantity: { increment: Math.abs(dto.quantity) } };
            }
            const existingLevel = await tx.stockLevel.findUnique({
                where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.warehouseId } }
            });
            let stockLevel;
            if (existingLevel) {
                stockLevel = await tx.stockLevel.update({
                    where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.warehouseId } },
                    data: updateClause
                });
            }
            else {
                stockLevel = await tx.stockLevel.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                        quantity: Math.max(0, dto.quantity)
                    }
                });
            }
            const finalRefId = dto.reason ? `[${dto.reason}] ${dto.referenceId || ''}`.trim() : dto.referenceId;
            await tx.stockMovement.create({
                data: {
                    productId: dto.productId,
                    warehouseId: dto.warehouseId,
                    quantity: deltaQuantity,
                    type: prismaType,
                    referenceId: finalRefId || null,
                    tenantId,
                },
            });
            if (stockLevel.quantity <= stockLevel.minThreshold) {
                const product = await tx.product.findUnique({
                    where: { id: dto.productId },
                    select: { name: true },
                });
                this.notificationsService.create(tenantId, {
                    type: notifications_dto_1.NotificationType.LOW_STOCK,
                    title: 'Low Stock Alert',
                    message: `${product?.name ?? dto.productId} is running low (${stockLevel.quantity} remaining).`,
                    meta: { productId: dto.productId, current: stockLevel.quantity, threshold: stockLevel.minThreshold },
                }).catch(() => { });
            }
            return stockLevel;
        });
    }
    async getProductStock(productId) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.client.stockLevel.findMany({
            where: {
                productId,
                warehouse: {
                    tenantId,
                    ...(this.tenantService.getBranchId() ? { branchId: this.tenantService.getBranchId() } : {})
                },
            },
            include: {
                warehouse: true,
            },
        });
    }
    async getStockMovements() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.stockMovement.findMany({
            where: { tenantId },
            include: {
                product: { select: { name: true, sku: true } },
                warehouse: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    }
    async performStocktake(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const referenceId = `STOCKTAKE-${new Date().toISOString().split('T')[0]}`;
        return this.prisma.$transaction(async (tx) => {
            const results = [];
            for (const item of dto.items) {
                const existingLevel = await tx.stockLevel.findUnique({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: dto.warehouseId } }
                });
                const currentQty = existingLevel ? existingLevel.quantity : 0;
                const variance = item.physicalQuantity - currentQty;
                if (variance === 0)
                    continue;
                const stockLevel = await tx.stockLevel.upsert({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: dto.warehouseId } },
                    create: {
                        productId: item.productId,
                        warehouseId: dto.warehouseId,
                        quantity: item.physicalQuantity
                    },
                    update: {
                        quantity: item.physicalQuantity
                    }
                });
                await tx.stockMovement.create({
                    data: {
                        tenantId,
                        productId: item.productId,
                        warehouseId: dto.warehouseId,
                        quantity: variance,
                        type: 'ADJUSTMENT',
                        referenceId
                    }
                });
                results.push(stockLevel);
            }
            return results;
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        notifications_service_1.NotificationsService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map