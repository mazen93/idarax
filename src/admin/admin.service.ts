import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const results = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.branch.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.tenant.count({ where: { subscriptionExpiresAt: { gt: now } } }),
      this.prisma.tenant.count({ where: { isTrial: true } }),
      this.prisma.tenant.count({
        where: { subscriptionExpiresAt: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) } }
      }),
      this.prisma.tenant.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.tenant.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      (this.prisma.tenant as any).groupBy({
        by: ['countryCode', 'country'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
    ]);

    const [
        totalTenants,
        totalBranches,
        totalOrders,
        revenueResult,
        activeSubscriptions,
        trialTenants,
        expiringSoon,
        newTenantsThisMonth,
        newTenantsLastMonth,
        tenantsByCountryRaw
      ] = results as any[];

    const tenantsByCountry = (tenantsByCountryRaw as any[]).map(c => ({
      country: c.country || 'Unknown',
      code: c.countryCode || '??',
      count: c._count.id
    }));

    const mrr = revenueResult._sum.totalAmount ? Number(revenueResult._sum.totalAmount) / 12 : 0;
    const growth = newTenantsLastMonth > 0
      ? (((newTenantsThisMonth - newTenantsLastMonth) / newTenantsLastMonth) * 100).toFixed(1)
      : null;

    return {
      activeTenants: totalTenants,
      totalBranches,
      totalOrders,
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
      mrr: Math.round(mrr),
      activeSubscriptions,
      trialTenants,
      expiringSoon,
      newTenantsThisMonth,
      growthPercent: growth,
      tenantsByCountry,
    };
  }

  async getTenantsWithStats() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        _count: { select: { branches: true, users: true, products: true, orders: true } },
        plan: true,
      },
    });
    return tenants.map(t => ({
      ...t,
      branchCount: t._count.branches,
      userCount: t._count.users,
      productCount: t._count.products,
      orderCount: t._count.orders,
    }));
  }

  // ── Filtered tenant list ───────────────────────────────────────────────────
  async getFilteredTenants(filter: {
    plan?: string;
    status?: string;
    search?: string;
    countryCode?: string;
    page?: number;
    limit?: number;
  }) {
    const { plan, status, search, countryCode, page = 1, limit = 20 } = filter;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {};

    if (plan) {
      where.plan = { name: plan };
    }

    if (status === 'ACTIVE') {
      where.subscriptionExpiresAt = { gt: now };
      where.isTrial = false;
    } else if (status === 'TRIAL') {
      where.isTrial = true;
    } else if (status === 'EXPIRED') {
      where.OR = [
        { subscriptionExpiresAt: { lt: now } },
        { subscriptionExpiresAt: null },
      ];
      where.isTrial = false;
    }

    if (countryCode) {
      where.countryCode = countryCode;
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { name: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          plan: true,
          _count: { select: { orders: true, users: true, branches: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants.map(t => ({
        ...t,
        orderCount: t._count.orders,
        userCount: t._count.users,
        branchCount: t._count.branches,
        subscriptionStatus: t.isTrial
          ? 'TRIAL'
          : t.subscriptionExpiresAt && t.subscriptionExpiresAt > now
            ? 'ACTIVE'
            : 'EXPIRED',
      })),
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  // ── Subscription analytics ─────────────────────────────────────────────────
  async getSubscriptionAnalytics() {
    const now = new Date();
    const plans = await this.prisma.subscriptionPlan.findMany();

    const planStats = await Promise.all(
      plans.map(async (plan) => {
        const count = await this.prisma.tenant.count({ where: { planId: plan.id } });
        return {
          planId: plan.id,
          planName: plan.name,
          price: Number(plan.price),
          tenantCount: count,
          mrr: count * Number(plan.price),
        };
      }),
    );

    const totalMrr = planStats.reduce((s, p) => s + p.mrr, 0);

    // Monthly growth over last 6 months
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = await this.prisma.tenant.count({
        where: { createdAt: { gte: start, lte: end } },
      });
      months.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        count,
      });
    }

    // Trial conversion (trial tenants who upgraded to paid)
    const trialConverted = await this.prisma.tenant.count({
      where: { isTrial: false, subscriptionExpiresAt: { gt: now } },
    });
    const totalTrialEver = await this.prisma.tenant.count(); // all tenants started as trial
    const conversionRate = totalTrialEver > 0 ? ((trialConverted / totalTrialEver) * 100).toFixed(1) : '0';

    // Expiring soon
    const expiringSoon = await this.prisma.tenant.findMany({
      where: {
        subscriptionExpiresAt: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) },
        isTrial: false,
      },
      select: { id: true, name: true, subscriptionExpiresAt: true, plan: true },
    });

    return {
      totalMrr,
      planBreakdown: planStats,
      monthlyGrowth: months,
      conversionRate,
      expiringSoon,
    };
  }

  // ── Upgrade requests ───────────────────────────────────────────────────────
  async getUpgradeRequests(status?: string) {
    const where: any = {};
    if (status) where.status = status;

    return (this.prisma as any).upgradeRequest.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, domain: true } },
        fromPlan: { select: { id: true, name: true } },
        toPlan: { select: { id: true, name: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async createUpgradeRequest(tenantId: string, toPlanId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const targetPlan = await this.prisma.subscriptionPlan.findUnique({ where: { id: toPlanId } });
    if (!targetPlan) throw new NotFoundException('Plan not found');

    // Check for existing pending request
    const existing = await (this.prisma as any).upgradeRequest.findFirst({
      where: { tenantId, status: 'PENDING' },
    });
    if (existing) throw new BadRequestException('You already have a pending upgrade request');

    return (this.prisma as any).upgradeRequest.create({
      data: {
        tenantId,
        fromPlanId: tenant.planId,
        toPlanId,
        status: 'PENDING',
      },
      include: {
        toPlan: { select: { id: true, name: true, features: true } },
      },
    });
  }

  async approveUpgradeRequest(requestId: string) {
    const request = await (this.prisma as any).upgradeRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Upgrade request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is already processed');

    // Upgrade tenant — default 365 days
    await this.updateTenantSubscription(request.tenantId, request.toPlanId, 365);

    // Activate tenant if it was pending
    await (this.prisma as any).tenant.update({
      where: { id: request.tenantId },
      data: { isActive: true, status: 'ACTIVE' }
    });

    return (this.prisma as any).upgradeRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', processedAt: new Date() },
    });
  }

  async rejectUpgradeRequest(requestId: string, note?: string) {
    const request = await (this.prisma as any).upgradeRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Upgrade request not found');

    return (this.prisma as any).upgradeRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', processedAt: new Date(), note },
    });
  }

  // ── Plans ──────────────────────────────────────────────────────────────────
  async getAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  // ── Tenant-facing subscription info ───────────────────────────────────────
  async getMySubscription(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const now = new Date();
    const status = tenant.isTrial
      ? 'TRIAL'
      : tenant.subscriptionExpiresAt && tenant.subscriptionExpiresAt > now
        ? 'ACTIVE'
        : 'EXPIRED';

    const pendingRequest = await (this.prisma as any).upgradeRequest.findFirst({
      where: { tenantId, status: 'PENDING' },
      include: { toPlan: true },
    });

    return {
      currentPlan: tenant.plan,
      status,
      expiresAt: tenant.subscriptionExpiresAt,
      isTrial: tenant.isTrial,
      trialExpiresAt: tenant.trialExpiresAt,
      pendingUpgradeRequest: pendingRequest,
    };
  }

  // ── Existing methods ───────────────────────────────────────────────────────
  async updateTenantSubscription(tenantId: string, planId: string, durationDays: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        planId, 
        subscriptionExpiresAt: expiresAt, 
        isTrial: false,
        maxBranches: plan.maxBranches,
        maxUsers: plan.maxUsers,
        maxPos: plan.maxPos,
        maxKds: plan.maxKds,
      },
    });
  }

  async getCountryAnalytics() {
    const tenants = await this.prisma.tenant.findMany({
      select: {
        country: true,
        countryCode: true,
        isTrial: true,
        _count: { select: { orders: true } },
        orders: {
          select: { totalAmount: true }
        }
      }
    });

    const countryMap: Record<string, any> = {};
    for (const t of tenants) {
      const code = t.countryCode || '??';
      if (!countryMap[code]) {
        countryMap[code] = {
          country: t.country || 'Unknown',
          code,
          tenantCount: 0,
          activeCount: 0,
          trialCount: 0,
          totalRevenue: 0,
          totalOrders: 0
        };
      }
      const data = countryMap[code];
      data.tenantCount++;
      if (t.isTrial) data.trialCount++; else data.activeCount++;
      data.totalOrders += t._count.orders;
      data.totalRevenue += t.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    }

    return Object.values(countryMap).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
  }

  async updateTenantCountry(tenantId: string, country: string, countryCode: string) {
    return (this.prisma.tenant as any).update({
      where: { id: tenantId },
      data: { country, countryCode }
    });
  }

  async approveTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { plan: true }
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const now = new Date();
    const expiry = tenant.subscriptionExpiresAt || new Date(now.getTime() + 30 * 86400000);

    return this.prisma.tenant.update({
      where: { id },
      data: {
        isActive: true,
        status: 'ACTIVE',
        subscriptionExpiresAt: expiry,
        isTrial: false,
      }
    });
  }

  async extendTrial(tenantId: string, days: number) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const currentExpiry = tenant?.trialExpiresAt || new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + days);
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { trialExpiresAt: newExpiry, isTrial: true },
    });
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
  }

  async getGlobalSettings() {
    const settings = await (this.prisma as any).globalSetting.findMany();
    const result: Record<string, any> = {
      defaultTrialDays: 14,
      platformEmail: 'support@idarax.io',
      maintenanceMode: false,
    };
    settings.forEach((s: any) => { result[s.key] = s.value; });
    return result;
  }

  async updateGlobalSetting(key: string, value: any) {
    return (this.prisma as any).globalSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
