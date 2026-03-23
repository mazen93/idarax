import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class TableService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async create(dto: CreateTableDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).table.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        return (this.prisma.client as any).table.findMany({
            where: { tenantId },
            include: {
                section: true,
                orders: {
                    where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
                    include: { items: true }
                }
            }
        });
    }

    async findOne(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const table = await (this.prisma.client as any).table.findUnique({
            where: { id },
            include: { section: true }
        });

        if (!table || table.tenantId !== tenantId) {
            throw new ForbiddenException('Table not found or access denied');
        }

        return table;
    }

    async moveOrder(sourceTableId: string, targetTableId: string) {
        const tenantId = this.tenantService.getTenantId();
        const targetTable = await this.findOne(targetTableId);

        if (targetTable.status !== 'AVAILABLE') {
            throw new ForbiddenException('Target table is not available');
        }

        const sourceTable = await (this.prisma.client as any).table.findUnique({
            where: { id: sourceTableId },
            include: {
                orders: {
                    where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } }
                }
            }
        });

        if (!sourceTable || sourceTable.orders.length === 0) {
            throw new ForbiddenException('No active order found on source table');
        }

        const activeOrder = sourceTable.orders[0];

        // 1. Clear old table
        await (this.prisma.client as any).table.update({
            where: { id: sourceTableId },
            data: { status: 'AVAILABLE', isMerged: false, parentTableId: null }
        });

        // 2. Update order with new table
        await (this.prisma.client as any).order.update({
            where: { id: activeOrder.id },
            data: { tableId: targetTableId }
        });

        // 3. Update target table status
        return (this.prisma.client as any).table.update({
            where: { id: targetTableId },
            data: { status: 'OCCUPIED' }
        });
    }

    async mergeTables(sourceId: string, targetId: string) {
        await this.findOne(sourceId);
        const target = await this.findOne(targetId);

        if (target.status !== 'OCCUPIED') {
            throw new ForbiddenException('Target table must have an active order to merge into');
        }

        return (this.prisma.client as any).table.update({
            where: { id: sourceId },
            data: {
                status: 'OCCUPIED',
                isMerged: true,
                parentTableId: targetId
            }
        });
    }

    async unmergeTable(id: string) {
        return (this.prisma.client as any).table.update({
            where: { id },
            data: {
                isMerged: false,
                parentTableId: null,
                status: 'AVAILABLE'
            }
        });
    }

    async checkout(id: string) {
        const table = await (this.prisma.client as any).table.findUnique({
            where: { id },
            include: {
                orders: {
                    where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } }
                }
            }
        });

        if (!table || table.orders.length === 0) {
            throw new ForbiddenException('No active order found for this table');
        }

        // Mark active orders as COMPLETED
        for (const order of table.orders) {
            await (this.prisma.client as any).order.update({
                where: { id: order.id },
                data: { status: 'COMPLETED' }
            });
        }

        // Reset table status (and any merged tables)
        await (this.prisma.client as any).table.updateMany({
            where: { OR: [{ id }, { parentTableId: id }] },
            data: { status: 'AVAILABLE', isMerged: false, parentTableId: null }
        });

        // Re-fetch orders with full details for printing
        const completedOrders = await (this.prisma.client as any).order.findMany({
            where: { id: { in: table.orders.map((o: any) => o.id) } },
            include: {
                items: { include: { product: true } },
                customer: true,
                table: true
            }
        });

        return {
            message: 'Checkout successful',
            orders: completedOrders
        };
    }

    async update(id: string, dto: UpdateTableDto) {
        await this.findOne(id); // Ensure exists and belongs to tenant

        return (this.prisma.client as any).table.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Ensure exists and belongs to tenant

        return (this.prisma.client as any).table.delete({
            where: { id },
        });
    }

    async generateTableQRCodes() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const tables = await (this.prisma.client as any).table.findMany({
            where: { tenantId }
        });

        // Use process.env.PUBLIC_FRONTEND_URL if available, otherwise fallback
        const frontendUrl = process.env.PUBLIC_FRONTEND_URL || 'http://localhost:3001';

        for (const table of tables) {
            const qrUrl = `${frontendUrl}/en/m/${tenantId}?table=${table.id}`;
            const qrBase64 = await QRCode.toDataURL(qrUrl, {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 512,
                color: {
                    dark: '#0f172a', // slate-900
                    light: '#ffffff'
                }
            });

            await (this.prisma.client as any).table.update({
                where: { id: table.id },
                data: { qrCodeUrl: qrBase64 }
            });
        }

        return {
            message: `Successfully generated ${tables.length} QR codes`,
            baseUrl: frontendUrl
        };
    }
}
