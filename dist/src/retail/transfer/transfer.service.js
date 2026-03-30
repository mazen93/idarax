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
exports.TransferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let TransferService = class TransferService {
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
        return this.prisma.stockTransfer.create({
            data: {
                ...dto,
                tenantId,
                status: 'PENDING'
            },
            include: {
                source: true,
                destination: true,
                product: true
            }
        });
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.stockTransfer.findMany({
            where: { tenantId },
            include: {
                source: true,
                destination: true,
                product: { select: { id: true, name: true, sku: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateStatus(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const transfer = await this.prisma.stockTransfer.update({
            where: { id, tenantId },
            data: { status: dto.status },
            include: { source: true, destination: true, product: true }
        });
        if (dto.status === 'COMPLETED') {
            await this.prisma.$transaction(async (tx) => {
                await tx.stockLevel.upsert({
                    where: { productId_warehouseId: { productId: transfer.productId, warehouseId: transfer.sourceId } },
                    update: { quantity: { decrement: transfer.quantity } },
                    create: { productId: transfer.productId, warehouseId: transfer.sourceId, quantity: -transfer.quantity }
                });
                await tx.stockLevel.upsert({
                    where: { productId_warehouseId: { productId: transfer.productId, warehouseId: transfer.destinationId } },
                    update: { quantity: { increment: transfer.quantity } },
                    create: { productId: transfer.productId, warehouseId: transfer.destinationId, quantity: transfer.quantity }
                });
                await tx.stockMovement.create({
                    data: {
                        tenantId,
                        productId: transfer.productId,
                        warehouseId: transfer.sourceId,
                        quantity: -transfer.quantity,
                        type: 'TRANSFER',
                        referenceId: `TRANSFER-OUT:${transfer.id}`
                    }
                });
                await tx.stockMovement.create({
                    data: {
                        tenantId,
                        productId: transfer.productId,
                        warehouseId: transfer.destinationId,
                        quantity: transfer.quantity,
                        type: 'TRANSFER',
                        referenceId: `TRANSFER-IN:${transfer.id}`
                    }
                });
            });
        }
        return transfer;
    }
};
exports.TransferService = TransferService;
exports.TransferService = TransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], TransferService);
//# sourceMappingURL=transfer.service.js.map