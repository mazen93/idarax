import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { DashboardGateway } from './dashboard.gateway';

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        @Inject(forwardRef(() => DashboardGateway))
        private dashboardGateway: DashboardGateway,
    ) { }

    private getQueryBranchId(filterBranchId?: string) {
        let branchId = this.tenantService.getBranchId();
        if (filterBranchId && filterBranchId !== 'all') branchId = filterBranchId;
        return branchId;
    }

    async getOverview(startDate?: Date, endDate?: Date) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const branchId = this.tenantService.getBranchId();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filterStart = startDate || today;
        const filterEnd = endDate || new Date();

        const [ordersInRange, kdsTickets, lowStockItems, activeTables] = await Promise.all([
            (this.prisma as any).order.findMany({
                where: {
                    tenantId,
                    ...(branchId ? { branchId } : {}),
                    createdAt: { gte: filterStart, lte: filterEnd },
                    status: { not: 'CANCELLED' }
                }
            }),
            (this.prisma as any).orderItem.count({
                where: { order: { tenantId, ...(branchId ? { branchId } : {}), status: 'PENDING' } }
            }),
            (this.prisma as any).product.count({
                where: {
                    tenantId,
                    stockLevels: {
                        some: {
                            quantity: { lte: 5 },
                            ...(branchId ? { warehouse: { branchId } } : {})
                        }
                    }
                }
            }),
            (this.prisma as any).table.count({
                where: {
                    tenantId,
                    ...(branchId ? { branchId } : {}),
                    status: 'OCCUPIED'
                }
            })
        ]);

        const grossSales = ordersInRange.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);

        return {
            grossSales,
            orderCount: ordersInRange.length,
            liveKdsTickets: kdsTickets,
            lowStockCount: lowStockItems,
            activeTables: activeTables,
        };
    }

    async getRevenueChartData(startDate?: Date, endDate?: Date) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const filterStart = startDate || thirtyDaysAgo;
        const filterEnd = endDate || new Date();

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                branchId: this.tenantService.getBranchId(),
                createdAt: { gte: filterStart, lte: filterEnd },
                status: { not: 'CANCELLED' },
            },
            select: { totalAmount: true, createdAt: true },
        });

        const dailyRevenue: Record<string, number> = {};
        orders.forEach((o: any) => {
            const date = o.createdAt.toISOString().split('T')[0];
            dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(o.totalAmount);
        });

        return Object.entries(dailyRevenue)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    async getInventoryStats() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const lowStock = await (this.prisma as any).product.findMany({
            where: {
                tenantId,
                stockLevels: { some: { quantity: { lte: 5 } } }
            },
            include: { stockLevels: true },
            take: 5
        });

        return {
            lowStockItems: lowStock.map((p: any) => ({
                id: p.id,
                name: p.name,
                stock: p.stockLevels.reduce((sum: number, sl: any) => sum + sl.quantity, 0)
            }))
        };
    }

    async getSalesReport(startDate: Date, endDate: Date) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                branchId: this.tenantService.getBranchId(),
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { not: 'CANCELLED' },
            },
        });

        const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);

        return {
            totalRevenue,
            orderCount: orders.length,
            averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
        };
    }

    async getTopProducts(limit: number = 5) {
        const tenantId = this.tenantService.getTenantId();

        const items = await (this.prisma as any).orderItem.findMany({
            where: {
                order: {
                    tenantId,
                    branchId: this.tenantService.getBranchId(),
                    status: { not: 'CANCELLED' }
                }
            },
            include: { product: true }
        });

        const productStats = items.reduce((acc: any, item: any) => {
            const productId = item.productId;
            if (!acc[productId]) {
                acc[productId] = { name: item.product.name, quantity: 0, revenue: 0 };
            }
            acc[productId].quantity += item.quantity;
            acc[productId].revenue += Number(item.price) * item.quantity;
            return acc;
        }, {} as any);

        return Object.values(productStats)
            .sort((a: any, b: any) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    async getDailySalesSummary(startDate: Date, endDate: Date, filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            },
            include: { branch: true, payments: true, refunds: true }
        });

        // Simple mock-like grouping for demo purposes representing complex accounting aggregation
        const summary = orders.reduce((acc: any, order: any) => {
            const date = order.createdAt.toISOString().split('T')[0];
            const key = `${date}_${order.branch?.name || 'Main'}`;
            if (!acc[key]) {
                acc[key] = {
                    report_date: date,
                    branch_name: order.branch?.name || 'Main',
                    register_id: 'REG-01', // Placeholder as Register is not strictly in Prisma model
                    gross_sales: 0,
                    discounts_total: 0,
                    refunds_total: 0,
                    net_sales: 0,
                    sales_tax_collected: 0,
                    tips_collected: 0,
                    total_payments: 0,
                    payment_cash: 0,
                    payment_card: 0,
                    other_payments: 0,
                    order_count: 0,
                    void_count: 0,
                    void_amount: 0,
                    avg_order_value: 0
                };
            }
            const o = acc[key];
            const amount = Number(order.totalAmount);
            const tax = Number(order.taxAmount || 0);
            const discount = Number(order.discountAmount || 0);
            const refund = order.refunds.reduce((sum: number, r: any) => sum + Number(r.amount), 0);

            o.gross_sales += amount;
            o.discounts_total += discount;
            o.refunds_total += refund;
            o.net_sales += (amount - tax - refund);
            o.sales_tax_collected += tax;
            o.order_count += 1;
            o.total_payments += amount - refund;
            o.avg_order_value = o.gross_sales / o.order_count;

            order.payments.forEach((p: any) => {
                const pAmount = Number(p.amount);
                const method = p.method?.toUpperCase();
                if (method === 'CASH') o.payment_cash += pAmount;
                else if (method === 'CARD' || method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method === 'VISA' || method === 'MASTERCARD') o.payment_card += pAmount;
                else o.other_payments += pAmount;
            });

            // Adjust payment methods for refunds
            order.refunds.forEach((r: any) => {
                const rAmount = Number(r.amount);
                const method = r.paymentMethod?.toUpperCase() || order.paymentMethod?.toUpperCase();
                if (method === 'CASH') o.payment_cash -= rAmount;
                else if (method === 'CARD' || method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method === 'VISA' || method === 'MASTERCARD') o.payment_card -= rAmount;
                else o.other_payments -= rAmount;
            });
            return acc;
        }, {});

        // If no orders, return an empty array
        if (Object.keys(summary).length === 0) {
            return [];
        }

        return Object.values(summary);
    }

    async getPaymentReconciliation(startDate: Date, endDate: Date, filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        const payments = await (this.prisma as any).payment.findMany({
            where: {
                order: { tenantId, ...(branchId ? { branchId } : {}) },
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED'
            }
        });

        if (payments.length === 0) {
            return [];
        }

        return payments.map((p: any) => {
            const amount = Number(p.amount);
            const fee = p.method === 'CASH' ? 0 : amount * 0.029 + 0.3; // Standard 2.9% + 30c fee
            return {
                transaction_date: p.createdAt.toISOString().split('T')[0],
                batch_id: 'BATCH-' + p.id.substring(0, 6).toUpperCase(),
                payment_method: p.method,
                gross_amount: amount,
                processor_fee: fee,
                net_deposit: amount - fee,
                variance: 0
            };
        });
    }

    async getCashDrawerReconciliation(startDate: Date, endDate: Date, filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        const sessions = await (this.prisma as any).drawerSession.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                openedAt: { gte: startDate, lte: endDate }
            },
            include: { branch: true, user: true, movements: true }
        });

        if (sessions.length === 0) {
            return [];
        }

        return sessions.map((s: any) => {
            let cash_sales = 0;
            let cash_refunds = 0;
            let cash_paid_out = 0;
            let cash_drops = 0;

            s.movements.forEach((m: any) => {
                const amt = Number(m.amount);
                if (m.type === 'CASH_IN') cash_sales += amt;
                else if (m.type === 'CASH_OUT') cash_refunds += amt; // Assuming out is refund/expense
            });

            const expected = Number(s.openingBalance) + cash_sales - cash_refunds - cash_paid_out - cash_drops;
            const actual = Number(s.closingBalance || expected);
            const over_short = actual - expected;

            return {
                shift_date: s.openedAt.toISOString().split('T')[0],
                branch_name: s.branch?.name || 'Main Branch',
                register_id: 'REG-XX',
                cashier_name: s.user?.name || 'Unknown',
                shift_start_time: s.openedAt.toTimeString().slice(0, 5),
                shift_end_time: s.closedAt ? s.closedAt.toTimeString().slice(0, 5) : 'Open',
                opening_cash: Number(s.openingBalance),
                cash_sales,
                cash_refunds,
                cash_paid_out,
                cash_drops,
                expected_cash: expected,
                actual_count: actual,
                over_short,
                over_short_status: over_short === 0 ? 'Balanced' : (over_short > 0 ? 'Over' : 'Short'),
                manager_approval: 'Auto',
                approval_notes: s.note || ''
            };
        });
    }

    async getInventoryValuation(filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        const products = await (this.prisma as any).product.findMany({
            where: { tenantId },
            include: { category: true, stockLevels: { include: { warehouse: { include: { branch: true } } } } }
        });

        if (products.length === 0) {
            return [];
        }

        const valuation: any[] = [];
        products.forEach((p: any) => {
            p.stockLevels.forEach((sl: any) => {
                const slBranchId = sl.warehouse?.branchId;
                if (branchId && slBranchId && slBranchId !== branchId) return;

                const cost = Number(p.costPrice || 0);
                valuation.push({
                    valuation_date: new Date().toISOString().split('T')[0],
                    branch_name: sl.warehouse?.branch?.name || sl.warehouse?.name || 'Warehouse',
                    product_sku: p.sku || 'N/A',
                    product_name: p.name,
                    category: p.category?.name || 'Uncategorized',
                    unit_of_measure: 'unit',
                    qty_on_hand: sl.quantity,
                    qty_reserved: 0,
                    qty_available: sl.quantity,
                    unit_cost: cost,
                    total_value: sl.quantity * cost,
                    days_on_hand: 30, // Mock calculation
                    last_movement_date: sl.updatedAt.toISOString().split('T')[0]
                });
            });
        });

        return valuation;
    }

    async getInventoryMovement(startDate: Date, endDate: Date, filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        const movements = await (this.prisma as any).stockMovement.findMany({
            where: {
                tenantId,
                ...(branchId ? { warehouse: { branchId } } : {}),
                createdAt: { gte: startDate, lte: endDate }
            },
            include: { product: true, warehouse: { include: { branch: true } } }
        });

        if (movements.length === 0) {
            return [];
        }

        return movements.map((m: any) => ({
            transaction_date: m.createdAt.toISOString().split('T')[0],
            transaction_time: m.createdAt.toTimeString().slice(0, 8),
            branch_name: m.warehouse?.branch?.name || m.warehouse?.name || 'Warehouse',
            product_sku: m.product?.sku || 'N/A',
            product_name: m.product?.name || 'Unknown',
            movement_type: m.type,
            reference_type: m.referenceId || 'N/A',
            qty_change: m.quantity,
            qty_after: m.quantity, // Since we don't store point-in-time balance in stockMovement
            unit_cost: Number(m.product?.costPrice || 0)
        }));
    }

    async getTaxLiability(startDate: Date, endDate: Date, filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        // Fetch dynamic tax rates
        const tenantSettings = await this.prisma.settings.findUnique({ where: { tenantId } });
        const branchSettingsList = await (this.prisma.client as any).branchSettings.findMany({ where: { tenantId } });
        
        const globalTaxRate = Number(tenantSettings?.taxRate || 0);
        const branchTaxRates: Record<string, number> = {};
        branchSettingsList.forEach((bs: any) => {
            if (bs.taxRate !== null && bs.taxRate !== undefined) {
                branchTaxRates[bs.branchId] = Number(bs.taxRate);
            }
        });

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            },
        });

        const summary = orders.reduce((acc: any, order: any) => {
            const date = order.createdAt.toISOString().split('T')[0];
            const orderBranchId = order.branchId;
            const taxRate = (orderBranchId && branchTaxRates[orderBranchId] !== undefined) 
                ? branchTaxRates[orderBranchId] 
                : globalTaxRate;

            const key = `${date}_VAT${taxRate}`;
            if (!acc[key]) {
                acc[key] = {
                    report_date: date,
                    tax_code: `VAT ${taxRate}%`,
                    tax_rate: taxRate,
                    taxable_amount: 0,
                    non_taxable_amount: 0,
                    tax_collected: 0,
                };
            }
            const o = acc[key];
            const amount = Number(order.totalAmount);
            const tax = Number(order.taxAmount || 0);
            o.taxable_amount += (amount - tax);
            o.tax_collected += tax;
            return acc;
        }, {});

        if (Object.keys(summary).length === 0) {
            return [];
        }

        return Object.values(summary);
    }

    async getCustomerSalesSummary(startDate: Date, endDate: Date, filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            },
            include: { customer: true }
        });

        const summaryObj = orders.reduce((acc: any, order: any) => {
            const customerId = order.customerId || 'walk-in';
            if (!acc[customerId]) {
                acc[customerId] = {
                    customer_name: order.customer ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : 'Walk-in Customer',
                    phone_number: order.customer?.phoneNumber || 'N/A',
                    order_count: 0,
                    gross_sales: 0,
                    avg_order_value: 0,
                    last_visit: order.createdAt.toISOString().split('T')[0]
                };
            }
            acc[customerId].order_count += 1;
            acc[customerId].gross_sales += Number(order.totalAmount || 0);
            acc[customerId].avg_order_value = acc[customerId].gross_sales / acc[customerId].order_count;

            if (order.createdAt > new Date(acc[customerId].last_visit)) {
                acc[customerId].last_visit = order.createdAt.toISOString().split('T')[0];
            }

            return acc;
        }, {});

        if (Object.keys(summaryObj).length === 0) {
            return [];
        }

        return Object.values(summaryObj).sort((a: any, b: any) => b.gross_sales - a.gross_sales);
    }

    async getCashierPerformance(startDate: Date, endDate: Date, filterBranchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            },
            include: { user: { select: { name: true } } }
        });

        const performance = orders.reduce((acc: any, order: any) => {
            const cashierId = order.userId || 'online';
            const cashierName = order.user?.name || 'Online / Others';

            if (!acc[cashierId]) {
                acc[cashierId] = {
                    cashier_name: cashierName,
                    order_count: 0,
                    gross_sales: 0,
                    avg_order_value: 0
                };
            }

            acc[cashierId].order_count += 1;
            const amount = Number(order.totalAmount || 0);
            acc[cashierId].gross_sales += amount;
            acc[cashierId].avg_order_value = acc[cashierId].gross_sales / acc[cashierId].order_count;

            return acc;
        }, {});


        return Object.values(performance).sort((a: any, b: any) => b.gross_sales - a.gross_sales);
    }

    async getStaffLeaderboard(startDate: Date, endDate: Date) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED',
                userId: { not: null },
            },
            select: {
                totalAmount: true,
                userId: true,
                user: { select: { name: true } }
            }
        });

        const leaderboard: Record<string, { id: string; name: string; revenue: number; orderCount: number }> = {};

        orders.forEach((o: any) => {
            if (!leaderboard[o.userId!]) {
                leaderboard[o.userId!] = { id: o.userId!, name: o.user?.name || 'Unknown', revenue: 0, orderCount: 0 };
            }
            leaderboard[o.userId!].revenue += Number(o.totalAmount);
            leaderboard[o.userId!].orderCount += 1;
        });

        return Object.values(leaderboard).sort((a, b) => b.revenue - a.revenue);
    }

    /**
     * Track the average time it takes each station to complete specific dishes.
     */
    async getKitchenPerformance(startDate: Date, endDate: Date) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();

        const completedItems = await (this.prisma as any).orderItem.findMany({
            where: {
                order: {
                    tenantId,
                    ...(branchId ? { branchId } : {}),
                    createdAt: { gte: startDate, lte: endDate },
                },
                status: 'READY',
                startedAt: { not: null },
                completedAt: { not: null },
            },
            include: { station: true, product: true }
        });

        const stationStats: Record<string, { stationName: string; totalItems: number; totalPrepTimeMs: number; avgPrepTimeMinutes: number }> = {};

        completedItems.forEach((item: any) => {
            const stationId = item.stationId || 'unassigned';
            const stationName = item.station?.name || 'Unassigned';

            if (!stationStats[stationId]) {
                stationStats[stationId] = { stationName, totalItems: 0, totalPrepTimeMs: 0, avgPrepTimeMinutes: 0 };
            }

            const prepTime = item.completedAt.getTime() - item.startedAt.getTime();
            stationStats[stationId].totalItems += 1;
            stationStats[stationId].totalPrepTimeMs += prepTime;
            stationStats[stationId].avgPrepTimeMinutes = (stationStats[stationId].totalPrepTimeMs / stationStats[stationId].totalItems) / 60000;
        });

        return Object.values(stationStats).sort((a, b) => b.avgPrepTimeMinutes - a.avgPrepTimeMinutes);
    }

    /**
     * Real-time exact profit margins per dish using snapshotted costPrice.
     */
    async getProductProfitability(startDate: Date, endDate: Date) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();

        const items = await (this.prisma as any).orderItem.findMany({
            where: {
                order: {
                    tenantId,
                    ...(branchId ? { branchId } : {}),
                    createdAt: { gte: startDate, lte: endDate },
                    status: { not: 'CANCELLED' }
                }
            },
            include: { product: { select: { name: true } } }
        });

        const productStats: Record<string, { name: string; quantity: number; totalRevenue: number; totalCost: number; totalProfit: number; margin: number }> = {};

        items.forEach((item: any) => {
            const productId = item.productId;
            if (!productStats[productId]) {
                productStats[productId] = { name: item.product.name, quantity: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0, margin: 0 };
            }

            const qty = item.quantity;
            const rev = Number(item.price) * qty;
            const cost = Number(item.costPrice || 0) * qty;

            productStats[productId].quantity += qty;
            productStats[productId].totalRevenue += rev;
            productStats[productId].totalCost += cost;
            productStats[productId].totalProfit += (rev - cost);
            productStats[productId].margin = (productStats[productId].totalProfit / productStats[productId].totalRevenue) * 100;
        });

        return Object.values(productStats).sort((a, b) => b.totalProfit - a.totalProfit);
    }

    /**
     * Push a live stats update to all connected dashboards for a tenant/branch.
     */
    async pushStatsUpdate(tenantId: string, branchId?: string) {
        try {
            // Get today's overview as the live payload
            const overview = await this.getOverview();
            this.dashboardGateway.emitStatsUpdate(tenantId, branchId || null, overview);
        } catch (error) {
            console.error('Failed to push dashboard stats update:', error);
        }
    }
}

