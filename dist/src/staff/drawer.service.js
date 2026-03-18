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
var DrawerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
let DrawerService = DrawerService_1 = class DrawerService {
    prisma;
    tenantService;
    logger = new common_1.Logger(DrawerService_1.name);
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async openDrawer(userId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        let branchId = dto.branchId || this.tenantService.getBranchId() || undefined;
        if (branchId) {
            const branch = await this.prisma.client.branch.findFirst({
                where: { id: branchId, tenantId }
            });
            if (!branch) {
                this.logger.warn(`Branch ${branchId} not found for tenant ${tenantId}. Using null.`);
                branchId = undefined;
            }
        }
        const session = await this.prisma.client.drawerSession.create({
            data: {
                userId,
                tenantId,
                branchId,
                openingBalance: dto.openingBalance,
                status: 'OPEN',
                note: dto.note,
            },
        });
        await this.prisma.client.cashMovement.create({
            data: {
                sessionId: session.id,
                amount: dto.openingBalance,
                type: 'OPENING',
                reason: 'Opening float',
            },
        });
        return session;
    }
    async closeDrawer(userId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const session = await this._requireOpenSession(userId, tenantId);
        const movements = await this.prisma.client.cashMovement.findMany({
            where: { sessionId: session.id },
        });
        const expectedBalance = movements.reduce((acc, m) => {
            const amt = Number(m.amount);
            if (m.type === 'CASH_OUT' || m.type === 'REFUND')
                return acc - amt;
            return acc + amt;
        }, 0);
        const discrepancy = dto.closingBalance - expectedBalance;
        await this.prisma.client.cashMovement.create({
            data: {
                sessionId: session.id,
                amount: dto.closingBalance,
                type: 'CLOSING',
                reason: dto.note,
            },
        });
        return this.prisma.client.drawerSession.update({
            where: { id: session.id },
            data: {
                closingBalance: dto.closingBalance,
                expectedBalance,
                status: 'CLOSED',
                closedAt: new Date(),
                note: dto.note || session.note,
            },
            include: { movements: { orderBy: { createdAt: 'asc' } } },
        }).then((s) => ({ ...s, discrepancy }));
    }
    async addMovement(userId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const session = await this._requireOpenSession(userId, tenantId);
        return this.prisma.client.cashMovement.create({
            data: {
                sessionId: session.id,
                amount: dto.amount,
                type: dto.type,
                reason: dto.reason,
            },
        });
    }
    async recordSale(tenantId, userId, amount, orderId) {
        const session = await this.prisma.drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN' },
        });
        if (!session)
            return;
        await this.prisma.cashMovement.create({
            data: { sessionId: session.id, amount, type: 'SALE', referenceId: orderId },
        });
    }
    async recordSaleByTenant(tenantId, branchId, amount, orderId) {
        let session = await this.prisma.drawerSession.findFirst({
            where: { tenantId, branchId, status: 'OPEN' },
        });
        if (!session && branchId) {
            session = await this.prisma.drawerSession.findFirst({
                where: { tenantId, branchId: null, status: 'OPEN' },
            });
        }
        if (!session && !branchId) {
            session = await this.prisma.drawerSession.findFirst({
                where: { tenantId, status: 'OPEN' },
            });
        }
        if (!session) {
            this.logger.warn(`No open drawer session found for tenant ${tenantId}, branch ${branchId}. Context IDs: T=${this.tenantService.getTenantId()}, B=${this.tenantService.getBranchId()}`);
            return;
        }
        await this.prisma.cashMovement.create({
            data: { sessionId: session.id, amount, type: 'SALE', referenceId: orderId, reason: 'Cash order' },
        });
    }
    async recordRefundByTenant(tenantId, branchId, amount, orderId) {
        let session = await this.prisma.drawerSession.findFirst({
            where: { tenantId, branchId, status: 'OPEN' },
        });
        if (!session && branchId) {
            session = await this.prisma.drawerSession.findFirst({
                where: { tenantId, branchId: null, status: 'OPEN' },
            });
        }
        if (!session) {
            this.logger.warn(`No open drawer session for refund: T=${tenantId}, B ${branchId}`);
            return;
        }
        await this.prisma.cashMovement.create({
            data: { sessionId: session.id, amount, type: 'REFUND', referenceId: orderId, reason: 'Cash refund' },
        });
    }
    async recordRefund(tenantId, userId, amount, orderId) {
        const session = await this.prisma.drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN' },
        });
        if (!session)
            return;
        await this.prisma.cashMovement.create({
            data: { sessionId: session.id, amount, type: 'REFUND', referenceId: orderId },
        });
    }
    async getCurrentSession(userId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
        const session = await this.prisma.client.drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN', ...(branchId ? { branchId } : {}) },
            include: {
                movements: { orderBy: { createdAt: 'asc' } },
                user: { select: { name: true } },
                branch: { select: { name: true } },
            },
        });
        if (!session)
            return null;
        const balance = session.movements.reduce((acc, m) => {
            const amt = Number(m.amount);
            if (m.type === 'CASH_OUT' || m.type === 'REFUND')
                return acc - amt;
            return acc + amt;
        }, 0);
        return { ...session, runningBalance: balance };
    }
    async getReport(sessionId) {
        const tenantId = this.tenantService.getTenantId();
        const session = await this.prisma.client.drawerSession.findUnique({
            where: { id: sessionId },
            include: {
                movements: { orderBy: { createdAt: 'asc' } },
                user: { select: { name: true, email: true } },
                branch: { select: { name: true } },
            },
        });
        if (!session || session.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Session not found');
        }
        const totals = {
            sales: 0, refunds: 0, cashIn: 0, cashOut: 0,
        };
        session.movements.forEach((m) => {
            const amt = Number(m.amount);
            if (m.type === 'SALE')
                totals.sales += amt;
            else if (m.type === 'REFUND')
                totals.refunds += amt;
            else if (m.type === 'CASH_IN')
                totals.cashIn += amt;
            else if (m.type === 'CASH_OUT')
                totals.cashOut += amt;
        });
        const expectedBalance = Number(session.openingBalance) +
            totals.sales - totals.refunds + totals.cashIn - totals.cashOut;
        const discrepancy = session.closingBalance != null
            ? Number(session.closingBalance) - expectedBalance
            : null;
        return { ...session, totals, expectedBalance, discrepancy };
    }
    async getHistory(from, to, branchId) {
        const tenantId = this.tenantService.getTenantId();
        const where = { tenantId };
        if (from || to) {
            where.openedAt = {};
            if (from)
                where.openedAt.gte = from;
            if (to)
                where.openedAt.lte = to;
        }
        return this.prisma.client.drawerSession.findMany({
            where,
            include: {
                user: { select: { name: true } },
                branch: { select: { name: true } },
                _count: { select: { movements: true } },
            },
            orderBy: { openedAt: 'desc' },
        });
    }
    async _requireOpenSession(userId, tenantId) {
        const branchId = this.tenantService.getBranchId();
        const session = await this.prisma.client.drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN', ...(branchId ? { branchId } : {}) },
        });
        if (!session)
            throw new common_1.BadRequestException('No open drawer session found for this user in this branch');
        return session;
    }
};
exports.DrawerService = DrawerService;
exports.DrawerService = DrawerService = DrawerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], DrawerService);
//# sourceMappingURL=drawer.service.js.map