import { Injectable, BadRequestException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CloseDrawerDto, OpenDrawerDto, AddMovementDto } from './dto/drawer.dto';

@Injectable()
export class DrawerService {
    private readonly logger = new Logger(DrawerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantService: TenantService,
    ) { }

    async openDrawer(userId: string, dto: OpenDrawerDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        let branchId = dto.branchId || this.tenantService.getBranchId() || undefined;

        // Verify branch exists and belongs to tenant
        if (branchId) {
            const branch = await (this.prisma.client as any).branch.findFirst({
                where: { id: branchId, tenantId }
            });
            if (!branch) {
                this.logger.warn(`Branch ${branchId} not found for tenant ${tenantId}. Using null.`);
                branchId = undefined;
            }
        }

        const tenant = await (this.prisma.client as any).tenant.findUnique({
            where: { id: tenantId }, select: { maxPos: true }
        });
        
        const currentCount = await (this.prisma.client as any).drawerSession.count({
            where: { tenantId, status: 'OPEN' }
        });
        
        if (currentCount >= (tenant?.maxPos || 1)) {
            throw new ForbiddenException(`You have reached your maximum active POS limit of ${tenant?.maxPos || 1} for this subscription. Please upgrade your plan or close another register.`);
        }

        const session = await (this.prisma.client as any).drawerSession.create({
            data: {
                userId,
                tenantId,
                branchId,
                openingBalance: dto.openingBalance,
                status: 'OPEN',
                note: dto.note,
            },
        });

        // Record OPENING movement
        await (this.prisma.client as any).cashMovement.create({
            data: {
                sessionId: session.id,
                amount: dto.openingBalance,
                type: 'OPENING',
                reason: 'Opening float',
            },
        });

        return session;
    }

    async closeDrawer(userId: string, dto: CloseDrawerDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        const session = await this._requireOpenSession(userId, tenantId);

        // Calculate expected balance from movements
        const movements = await (this.prisma.client as any).cashMovement.findMany({
            where: { sessionId: session.id },
        });

        const expectedBalance = movements.reduce((acc: number, m: any) => {
            const amt = Number(m.amount);
            if (m.type === 'CASH_OUT' || m.type === 'REFUND') return acc - amt;
            return acc + amt;
        }, 0);

        const discrepancy = dto.closingBalance - expectedBalance;

        // Record CLOSING movement
        await (this.prisma.client as any).cashMovement.create({
            data: {
                sessionId: session.id,
                amount: dto.closingBalance,
                type: 'CLOSING',
                reason: dto.note,
            },
        });

        return (this.prisma.client as any).drawerSession.update({
            where: { id: session.id },
            data: {
                closingBalance: dto.closingBalance,
                expectedBalance,
                status: 'CLOSED',
                closedAt: new Date(),
                note: dto.note || session.note,
            },
            include: { movements: { orderBy: { createdAt: 'asc' } } },
        }).then((s: any) => ({ ...s, discrepancy }));
    }

    async addMovement(userId: string, dto: AddMovementDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        const session = await this._requireOpenSession(userId, tenantId);

        return (this.prisma.client as any).cashMovement.create({
            data: {
                sessionId: session.id,
                amount: dto.amount,
                type: dto.type,
                reason: dto.reason,
                referenceId: dto.referenceId,
            },
        });
    }

    /** Called internally from OrderService when a CASH order is paid */
    async recordSale(tenantId: string, userId: string, amount: number, orderId: string) {
        const session = await (this.prisma as any).drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN' },
        });
        if (!session) return;
        await (this.prisma as any).cashMovement.create({
            data: { sessionId: session.id, amount, type: 'SALE', referenceId: orderId },
        });
    }

    /**
     * Called from OrderService — finds the currently OPEN drawer for this tenant+branch
     * (regardless of which cashier opened it, since there's only one open at a time per branch).
     */
    async recordSaleByTenant(tenantId: string, branchId: string | undefined, amount: number, orderId: string) {
        let session = await (this.prisma as any).drawerSession.findFirst({
            where: { tenantId, branchId, status: 'OPEN' },
        });

        // Fallback 1: Try finding a global session (branchId: null)
        if (!session && branchId) {
            session = await (this.prisma as any).drawerSession.findFirst({
                where: { tenantId, branchId: null, status: 'OPEN' },
            });
        }

        // Fallback 2: Case where drawer was opened with a branch ID but order doesn't have it
        if (!session && !branchId) {
            session = await (this.prisma as any).drawerSession.findFirst({
                where: { tenantId, status: 'OPEN' },
            });
        }

        if (!session) {
            this.logger.warn(`No open drawer session found for tenant ${tenantId}, branch ${branchId}. Context IDs: T=${this.tenantService.getTenantId()}, B=${this.tenantService.getBranchId()}`);
            return;
        }

        await (this.prisma as any).cashMovement.create({
            data: { sessionId: session.id, amount, type: 'SALE', referenceId: orderId, reason: 'Cash order' },
        });
    }

    /** Called internally from RefundService when a CASH refund is issued */
    async recordRefundByTenant(tenantId: string, branchId: string | undefined, amount: number, orderId: string) {
        let session = await (this.prisma as any).drawerSession.findFirst({
            where: { tenantId, branchId, status: 'OPEN' },
        });

        if (!session && branchId) {
            session = await (this.prisma as any).drawerSession.findFirst({
                where: { tenantId, branchId: null, status: 'OPEN' },
            });
        }

        if (!session) {
            this.logger.warn(`No open drawer session for refund: T=${tenantId}, B ${branchId}`);
            return;
        }

        await (this.prisma as any).cashMovement.create({
            data: { sessionId: session.id, amount, type: 'REFUND', referenceId: orderId, reason: 'Cash refund' },
        });
    }

    async recordRefund(tenantId: string, userId: string, amount: number, orderId: string) {
        const session = await (this.prisma as any).drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN' },
        });
        if (!session) return;
        await (this.prisma as any).cashMovement.create({
            data: { sessionId: session.id, amount, type: 'REFUND', referenceId: orderId },
        });
    }

    /** Helper for OrderService validation */
    async hasOpenSession(tenantId: string, branchId: string | null | undefined, userId: string): Promise<boolean> {
        let where: any = { userId, tenantId, status: 'OPEN' };
        if (branchId) {
            where.OR = [
                { branchId },
                { branchId: null }
            ];
        }

        const session = await (this.prisma.client as any).drawerSession.findFirst({
            where,
            select: { id: true }
        });
        return !!session;
    }

    async getCurrentSession(userId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();

        let session = await (this.prisma.client as any).drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN', ...(branchId ? { branchId } : {}) },
            include: {
                movements: { orderBy: { createdAt: 'asc' } },
                user: { select: { name: true } },
                branch: { select: { name: true } },
            },
            orderBy: { openedAt: 'desc' }
        });

        if (!session && branchId) {
            session = await (this.prisma.client as any).drawerSession.findFirst({
                where: { userId, tenantId, status: 'OPEN' },
                include: {
                    movements: { orderBy: { createdAt: 'asc' } },
                    user: { select: { name: true } },
                    branch: { select: { name: true } },
                },
                orderBy: { openedAt: 'desc' }
            });
        }

        if (!session) return null;

        // Compute running balance from movements
        const balance = session.movements.reduce((acc: number, m: any) => {
            const amt = Number(m.amount);
            if (m.type === 'CASH_OUT' || m.type === 'REFUND') return acc - amt;
            return acc + amt;
        }, 0);

        return { ...session, runningBalance: balance };
    }

    async getReport(sessionId: string) {
        const tenantId = this.tenantService.getTenantId();
        const session = await (this.prisma.client as any).drawerSession.findUnique({
            where: { id: sessionId },
            include: {
                movements: { orderBy: { createdAt: 'asc' } },
                user: { select: { name: true, email: true } },
                branch: { select: { name: true } },
            },
        });

        if (!session || session.tenantId !== tenantId) {
            throw new NotFoundException('Session not found');
        }

        const totals = {
            sales: 0, refunds: 0, cashIn: 0, cashOut: 0,
        };
        session.movements.forEach((m: any) => {
            const amt = Number(m.amount);
            if (m.type === 'SALE') totals.sales += amt;
            else if (m.type === 'REFUND') totals.refunds += amt;
            else if (m.type === 'CASH_IN') totals.cashIn += amt;
            else if (m.type === 'CASH_OUT') totals.cashOut += amt;
        });

        const expectedBalance = Number(session.openingBalance) +
            totals.sales - totals.refunds + totals.cashIn - totals.cashOut;

        const discrepancy = session.closingBalance != null
            ? Number(session.closingBalance) - expectedBalance
            : null;

        return { ...session, totals, expectedBalance, discrepancy };
    }
    async getHistory(from?: Date, to?: Date, branchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const where: any = { tenantId };
        // branchId filter is automatically handled by PrismaService extension if in context

        if (from || to) {
            where.openedAt = {};
            if (from) where.openedAt.gte = from;
            if (to) where.openedAt.lte = to;
        }

        return (this.prisma.client as any).drawerSession.findMany({
            where,
            include: {
                user: { select: { name: true } },
                branch: { select: { name: true } },
                _count: { select: { movements: true } },
            },
            orderBy: { openedAt: 'desc' },
        });
    }

    private async _requireOpenSession(userId: string, tenantId: string) {
        const branchId = this.tenantService.getBranchId();
        let session = await (this.prisma.client as any).drawerSession.findFirst({
            where: { userId, tenantId, status: 'OPEN', ...(branchId ? { branchId } : {}) },
            orderBy: { openedAt: 'desc' }
        });

        if (!session && branchId) {
            session = await (this.prisma.client as any).drawerSession.findFirst({
                where: { userId, tenantId, status: 'OPEN' },
                orderBy: { openedAt: 'desc' }
            });
        }

        if (!session) throw new BadRequestException('No open drawer session found for this user in this branch');
        return session;
    }
}
