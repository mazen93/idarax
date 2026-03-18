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
exports.TableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let TableService = class TableService {
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
        return this.prisma.client.table.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.table.findMany({
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
    async findOne(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const table = await this.prisma.client.table.findUnique({
            where: { id },
            include: { section: true }
        });
        if (!table || table.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Table not found or access denied');
        }
        return table;
    }
    async moveOrder(sourceTableId, targetTableId) {
        const tenantId = this.tenantService.getTenantId();
        const targetTable = await this.findOne(targetTableId);
        if (targetTable.status !== 'AVAILABLE') {
            throw new common_1.ForbiddenException('Target table is not available');
        }
        const sourceTable = await this.prisma.client.table.findUnique({
            where: { id: sourceTableId },
            include: {
                orders: {
                    where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } }
                }
            }
        });
        if (!sourceTable || sourceTable.orders.length === 0) {
            throw new common_1.ForbiddenException('No active order found on source table');
        }
        const activeOrder = sourceTable.orders[0];
        await this.prisma.client.table.update({
            where: { id: sourceTableId },
            data: { status: 'AVAILABLE', isMerged: false, parentTableId: null }
        });
        await this.prisma.client.order.update({
            where: { id: activeOrder.id },
            data: { tableId: targetTableId }
        });
        return this.prisma.client.table.update({
            where: { id: targetTableId },
            data: { status: 'OCCUPIED' }
        });
    }
    async mergeTables(sourceId, targetId) {
        await this.findOne(sourceId);
        const target = await this.findOne(targetId);
        if (target.status !== 'OCCUPIED') {
            throw new common_1.ForbiddenException('Target table must have an active order to merge into');
        }
        return this.prisma.client.table.update({
            where: { id: sourceId },
            data: {
                status: 'OCCUPIED',
                isMerged: true,
                parentTableId: targetId
            }
        });
    }
    async unmergeTable(id) {
        return this.prisma.client.table.update({
            where: { id },
            data: {
                isMerged: false,
                parentTableId: null,
                status: 'AVAILABLE'
            }
        });
    }
    async checkout(id) {
        const table = await this.prisma.client.table.findUnique({
            where: { id },
            include: {
                orders: {
                    where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } }
                }
            }
        });
        if (!table || table.orders.length === 0) {
            throw new common_1.ForbiddenException('No active order found for this table');
        }
        for (const order of table.orders) {
            await this.prisma.client.order.update({
                where: { id: order.id },
                data: { status: 'COMPLETED' }
            });
        }
        await this.prisma.client.table.updateMany({
            where: { OR: [{ id }, { parentTableId: id }] },
            data: { status: 'AVAILABLE', isMerged: false, parentTableId: null }
        });
        const completedOrders = await this.prisma.client.order.findMany({
            where: { id: { in: table.orders.map((o) => o.id) } },
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
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.client.table.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.client.table.delete({
            where: { id },
        });
    }
};
exports.TableService = TableService;
exports.TableService = TableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], TableService);
//# sourceMappingURL=table.service.js.map