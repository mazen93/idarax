import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateTransferDto, UpdateTransferStatusDto } from './dto/transfer.dto';

@Injectable()
export class TransferService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async create(dto: CreateTransferDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

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
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

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

    async updateStatus(id: string, dto: UpdateTransferStatusDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const transfer = await this.prisma.stockTransfer.update({
            where: { id, tenantId },
            data: { status: dto.status },
            include: { source: true, destination: true, product: true }
        });

        // If completed, move stock between warehouses
        if (dto.status === 'COMPLETED') {
            await this.prisma.$transaction([
                this.prisma.stockLevel.upsert({
                    where: { productId_warehouseId: { productId: transfer.productId, warehouseId: transfer.sourceId } },
                    update: { quantity: { decrement: transfer.quantity } },
                    create: { productId: transfer.productId, warehouseId: transfer.sourceId, quantity: -transfer.quantity }
                }),
                this.prisma.stockLevel.upsert({
                    where: { productId_warehouseId: { productId: transfer.productId, warehouseId: transfer.destinationId } },
                    update: { quantity: { increment: transfer.quantity } },
                    create: { productId: transfer.productId, warehouseId: transfer.destinationId, quantity: transfer.quantity }
                })
            ]);
        }

        return transfer;
    }
}
