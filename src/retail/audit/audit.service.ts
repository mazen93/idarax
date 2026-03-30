import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { StartAuditDto, UpdateAuditDto } from './dto/audit.dto';

@Injectable()
export class AuditService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async startAudit(dto: StartAuditDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).$transaction(async (tx: any) => {
            // 1. Create the audit session
            const audit = await tx.stockAudit.create({
                data: {
                    warehouseId: dto.warehouseId,
                    status: 'PENDING'
                }
            });

            // 2. Fetch products to audit
            const products = await tx.stockLevel.findMany({
                where: {
                    warehouseId: dto.warehouseId,
                    ...(dto.productIds?.length ? { productId: { in: dto.productIds } } : {})
                },
                include: { product: { select: { name: true, sku: true } } }
            });

            // 3. Create audit items with current expected quantity
            await tx.stockAuditItem.createMany({
                data: products.map((p: any) => ({
                    auditId: audit.id,
                    productId: p.productId,
                    expectedQuantity: p.quantity,
                    physicalQuantity: p.quantity, // Default to expected, user will update
                    variance: 0
                }))
            });

            return (this.prisma.client as any).stockAudit.findUnique({
                where: { id: audit.id },
                include: { items: { include: { product: true } } }
            });
        });
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).stockAudit.findMany({
            include: { warehouse: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const audit = await (this.prisma.client as any).stockAudit.findUnique({
            where: { id },
            include: {
                warehouse: true,
                items: { include: { product: true } }
            }
        });

        if (!audit) throw new NotFoundException('Audit session not found');
        return audit;
    }

    async updateAudit(id: string, dto: UpdateAuditDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).$transaction(async (tx: any) => {
            const audit = await tx.stockAudit.findUnique({ where: { id } });
            if (!audit || audit.status !== 'PENDING') {
                throw new ForbiddenException('Audit session is not in PENDING state');
            }

            for (const item of dto.items) {
                const auditItem = await tx.stockAuditItem.findFirst({
                    where: { auditId: id, productId: item.productId }
                });

                if (auditItem) {
                    const variance = item.physicalQuantity - auditItem.expectedQuantity;
                    await tx.stockAuditItem.update({
                        where: { id: auditItem.id },
                        data: {
                            physicalQuantity: item.physicalQuantity,
                            variance
                        }
                    });
                }
            }

            return (this.prisma.client as any).stockAudit.findUnique({
                where: { id },
                include: { items: { include: { product: true } } }
            });
        });
    }

    async commitAudit(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).$transaction(async (tx: any) => {
            const audit = await tx.stockAudit.findUnique({
                where: { id },
                include: { items: true }
            });

            if (!audit || audit.status !== 'PENDING') {
                throw new ForbiddenException('Audit session is not in PENDING state');
            }

            // 1. Mark as COMPLETED
            await tx.stockAudit.update({
                where: { id },
                data: { status: 'COMPLETED' }
            });

            // 2. Perform Stock Adjustments for items with variance
            for (const item of audit.items) {
                if (item.variance !== 0) {
                    // Update StockLevel
                    await tx.stockLevel.upsert({
                        where: { productId_warehouseId: { productId: item.productId, warehouseId: audit.warehouseId } },
                        update: { quantity: item.physicalQuantity },
                        create: {
                            productId: item.productId,
                            warehouseId: audit.warehouseId,
                            quantity: item.physicalQuantity
                        }
                    });

                    // Log Stock Movement
                    await tx.stockMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: audit.warehouseId,
                            quantity: item.variance,
                            type: 'ADJUSTMENT',
                            referenceId: `AUDIT:${audit.id}`
                        }
                    });
                }
            }

            return { success: true, auditId: id };
        });
    }

    async cancelAudit(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).stockAudit.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
    }
}
