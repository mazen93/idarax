"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
const QRCode = __importStar(require("qrcode"));
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
    async generateTableQRCodes() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const tables = await this.prisma.client.table.findMany({
            where: { tenantId }
        });
        const frontendUrl = process.env.PUBLIC_FRONTEND_URL || 'http://localhost:3001';
        for (const table of tables) {
            const qrUrl = `${frontendUrl}/en/m/${tenantId}?table=${table.id}`;
            const qrBase64 = await QRCode.toDataURL(qrUrl, {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 512,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            });
            await this.prisma.client.table.update({
                where: { id: table.id },
                data: { qrCodeUrl: qrBase64 }
            });
        }
        return {
            message: `Successfully generated ${tables.length} QR codes`,
            baseUrl: frontendUrl
        };
    }
};
exports.TableService = TableService;
exports.TableService = TableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], TableService);
//# sourceMappingURL=table.service.js.map