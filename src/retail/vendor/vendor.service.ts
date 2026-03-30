import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async create(dto: CreateVendorDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.vendor.create({
            data: {
                ...dto,
                tenantId
            }
        });
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.vendor.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async update(id: string, dto: UpdateVendorDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.vendor.update({
            where: { id, tenantId },
            data: dto
        });
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.prisma.vendor.delete({
            where: { id, tenantId }
        });
    }

    async linkProduct(vendorId: string, dto: { productId: string; costPrice: number }) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
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

    async unlinkProduct(vendorId: string, productId: string) {
        return this.prisma.vendorProduct.delete({
            where: {
                vendorId_productId: { vendorId, productId }
            }
        });
    }

    async getProducts(vendorId: string) {
        return (this.prisma.client as any).vendorProduct.findMany({
            where: { vendorId },
            include: { product: true }
        });
    }

    async getPurchaseHistory(vendorId: string) {
        return (this.prisma.client as any).purchaseOrder.findMany({
            where: { vendorId },
            include: { warehouse: true, branch: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getSpendAnalytics(vendorId: string) {
        const totalSpent = await (this.prisma.client as any).purchaseOrder.aggregate({
            where: { vendorId, status: 'RECEIVED' },
            _sum: { totalAmount: true }
        });

        const orderCount = await (this.prisma.client as any).purchaseOrder.count({
            where: { vendorId }
        });

        return {
            totalSpent: totalSpent._sum.totalAmount || 0,
            orderCount
        };
    }
}
