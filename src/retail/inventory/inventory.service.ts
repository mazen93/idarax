import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateWarehouseDto, AdjustStockDto, StocktakeDto } from './dto/inventory.dto';
// MovementType import removed to avoid lint issues
import { KdsGateway } from '../../restaurant/kds/kds.gateway';

@Injectable()
export class InventoryService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        private kdsGateway: KdsGateway,
    ) { }

    async createWarehouse(dto: CreateWarehouseDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).warehouse.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }

    async getWarehouses() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).warehouse.findMany({
            where: { tenantId },
        });
    }

    async adjustStock(dto: AdjustStockDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Map frontend type strings to Prisma MovementType enum
        const movementTypeMap: Record<string, string> = {
            ADD: 'RESTOCK',
            REMOVE: 'ADJUSTMENT',
            SET: 'ADJUSTMENT',
            RESTOCK: 'RESTOCK',
            ADJUSTMENT: 'ADJUSTMENT',
            DAMAGE: 'DAMAGE',
            RETURN: 'RETURN',
            SALE: 'SALE',
        };
        // Manual adjustments should always be tagged as ADJUSTMENT for auditing
        const prismaType = 'ADJUSTMENT';

        return (this.prisma as any).$transaction(async (tx: any) => {
            // Determine the quantity delta based on type
            let deltaQuantity = dto.quantity;
            let updateClause: any;

            if (dto.type === 'REMOVE') {
                deltaQuantity = -Math.abs(dto.quantity);
                updateClause = { quantity: { decrement: Math.abs(dto.quantity) } };
            } else if (dto.type === 'SET') {
                updateClause = { quantity: dto.quantity };
            } else {
                // ADD / RESTOCK
                deltaQuantity = Math.abs(dto.quantity);
                updateClause = { quantity: { increment: Math.abs(dto.quantity) } };
            }

            // 1. Update or Create StockLevel
            const existingLevel = await tx.stockLevel.findUnique({
                where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.warehouseId } }
            });

            let stockLevel;
            if (existingLevel) {
                stockLevel = await tx.stockLevel.update({
                    where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.warehouseId } },
                    data: updateClause
                });
            } else {
                stockLevel = await tx.stockLevel.create({
                    data: {
                        productId: dto.productId,
                        warehouseId: dto.warehouseId,
                        quantity: Math.max(0, dto.quantity)
                    }
                });
            }

            // 2. Log the movement
            const finalRefId = dto.reason ? `[${dto.reason}] ${dto.referenceId || ''}`.trim() : dto.referenceId;
            await tx.stockMovement.create({
                data: {
                    productId: dto.productId,
                    warehouseId: dto.warehouseId,
                    quantity: deltaQuantity,
                    type: prismaType as any,
                    referenceId: finalRefId || null,
                    tenantId,
                },
            });

            // 3. Emit low stock alert if applicable
            if (stockLevel.quantity <= 5) {
                try {
                    this.kdsGateway.server.to(`tenant:${tenantId}`).emit('inventory_alert', {
                        type: 'LOW_STOCK',
                        productId: dto.productId,
                        current: stockLevel.quantity,
                    });
                } catch { }
            }

            return stockLevel;
        });
    }

    async getProductStock(productId: string) {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma.client as any).stockLevel.findMany({
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
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).stockMovement.findMany({
            where: { tenantId },
            include: {
                product: { select: { name: true, sku: true } },
                warehouse: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
    }

    async performStocktake(dto: StocktakeDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const referenceId = `STOCKTAKE-${new Date().toISOString().split('T')[0]}`;

        return (this.prisma as any).$transaction(async (tx: any) => {
            const results = [];

            for (const item of dto.items) {
                // 1. Get current stock
                const existingLevel = await tx.stockLevel.findUnique({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: dto.warehouseId } }
                });

                const currentQty = existingLevel ? existingLevel.quantity : 0;
                const variance = item.physicalQuantity - currentQty;

                if (variance === 0) continue; // No change needed

                // 2. Update StockLevel (Set exact)
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

                // 3. Log Stock Movement
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
}
