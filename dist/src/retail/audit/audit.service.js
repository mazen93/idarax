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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let AuditService = class AuditService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async startAudit(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.$transaction(async (tx) => {
            const audit = await tx.stockAudit.create({
                data: {
                    warehouseId: dto.warehouseId,
                    status: 'PENDING'
                }
            });
            const products = await tx.stockLevel.findMany({
                where: {
                    warehouseId: dto.warehouseId,
                    ...(dto.productIds?.length ? { productId: { in: dto.productIds } } : {})
                },
                include: { product: { select: { name: true, sku: true } } }
            });
            await tx.stockAuditItem.createMany({
                data: products.map((p) => ({
                    auditId: audit.id,
                    productId: p.productId,
                    expectedQuantity: p.quantity,
                    physicalQuantity: p.quantity,
                    variance: 0
                }))
            });
            return this.prisma.client.stockAudit.findUnique({
                where: { id: audit.id },
                include: { items: { include: { product: true } } }
            });
        });
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.stockAudit.findMany({
            include: { warehouse: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const audit = await this.prisma.client.stockAudit.findUnique({
            where: { id },
            include: {
                warehouse: true,
                items: { include: { product: true } }
            }
        });
        if (!audit)
            throw new common_1.NotFoundException('Audit session not found');
        return audit;
    }
    async updateAudit(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.$transaction(async (tx) => {
            const audit = await tx.stockAudit.findUnique({ where: { id } });
            if (!audit || audit.status !== 'PENDING') {
                throw new common_1.ForbiddenException('Audit session is not in PENDING state');
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
            return this.prisma.client.stockAudit.findUnique({
                where: { id },
                include: { items: { include: { product: true } } }
            });
        });
    }
    async commitAudit(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.$transaction(async (tx) => {
            const audit = await tx.stockAudit.findUnique({
                where: { id },
                include: { items: true }
            });
            if (!audit || audit.status !== 'PENDING') {
                throw new common_1.ForbiddenException('Audit session is not in PENDING state');
            }
            await tx.stockAudit.update({
                where: { id },
                data: { status: 'COMPLETED' }
            });
            for (const item of audit.items) {
                if (item.variance !== 0) {
                    await tx.stockLevel.upsert({
                        where: { productId_warehouseId: { productId: item.productId, warehouseId: audit.warehouseId } },
                        update: { quantity: item.physicalQuantity },
                        create: {
                            productId: item.productId,
                            warehouseId: audit.warehouseId,
                            quantity: item.physicalQuantity
                        }
                    });
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
    async cancelAudit(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.stockAudit.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], AuditService);
//# sourceMappingURL=audit.service.js.map