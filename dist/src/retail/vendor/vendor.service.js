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
exports.VendorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let VendorService = class VendorService {
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
        return this.prisma.vendor.create({
            data: {
                ...dto,
                tenantId
            }
        });
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.vendor.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async update(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.vendor.update({
            where: { id, tenantId },
            data: dto
        });
    }
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.vendor.delete({
            where: { id, tenantId }
        });
    }
    async linkProduct(vendorId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.vendorProduct.upsert({
            where: {
                vendorId_productId: { vendorId, productId: dto.productId }
            },
            create: {
                vendorId,
                productId: dto.productId,
                costPrice: dto.costPrice,
                tenantId
            },
            update: {
                costPrice: dto.costPrice
            }
        });
    }
    async unlinkProduct(vendorId, productId) {
        return this.prisma.vendorProduct.delete({
            where: {
                vendorId_productId: { vendorId, productId }
            }
        });
    }
    async getProducts(vendorId) {
        return this.prisma.client.vendorProduct.findMany({
            where: { vendorId },
            include: { product: true }
        });
    }
    async getPurchaseHistory(vendorId) {
        return this.prisma.client.purchaseOrder.findMany({
            where: { vendorId },
            include: { warehouse: true, branch: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getSpendAnalytics(vendorId) {
        const totalSpent = await this.prisma.client.purchaseOrder.aggregate({
            where: { vendorId, status: 'RECEIVED' },
            _sum: { totalAmount: true }
        });
        const orderCount = await this.prisma.client.purchaseOrder.count({
            where: { vendorId }
        });
        return {
            totalSpent: totalSpent._sum.totalAmount || 0,
            orderCount
        };
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map