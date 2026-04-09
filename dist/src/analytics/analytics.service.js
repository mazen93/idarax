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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
const dashboard_gateway_1 = require("./dashboard.gateway");
let AnalyticsService = class AnalyticsService {
    prisma;
    tenantService;
    dashboardGateway;
    constructor(prisma, tenantService, dashboardGateway) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.dashboardGateway = dashboardGateway;
    }
    getQueryBranchId(filterBranchId) {
        let branchId = this.tenantService.getBranchId();
        if (filterBranchId && filterBranchId !== 'all')
            branchId = filterBranchId;
        return branchId;
    }
    async getOverview(startDate, endDate) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filterStart = startDate || today;
        const filterEnd = endDate || new Date();
        const [ordersInRange, kdsTickets, lowStockItems, activeTables] = await Promise.all([
            this.prisma.order.findMany({
                where: {
                    tenantId,
                    ...(branchId ? { branchId } : {}),
                    createdAt: { gte: filterStart, lte: filterEnd },
                    status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
                },
                include: { items: true, refunds: true }
            }),
            this.prisma.orderItem.count({
                where: { order: { tenantId, ...(branchId ? { branchId } : {}), status: 'PENDING' } }
            }),
            this.prisma.product.count({
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
            this.prisma.table.count({
                where: {
                    tenantId,
                    ...(branchId ? { branchId } : {}),
                    status: 'OCCUPIED'
                }
            })
        ]);
        let grossSales = 0;
        let totalCost = 0;
        let totalTax = 0;
        let totalRefunds = 0;
        ordersInRange.forEach((o) => {
            grossSales += Number(o.totalAmount || 0);
            totalTax += Number(o.taxAmount || 0);
            const refundsForOrder = o.refunds?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
            totalRefunds += refundsForOrder;
            o.items?.forEach((item) => {
                const qty = item.quantity || 0;
                totalCost += Number(item.costPrice || 0) * qty;
            });
        });
        const netSales = grossSales - totalTax - totalRefunds;
        const netProfit = netSales - totalCost;
        return {
            grossSales,
            netSales,
            totalCost,
            netProfit,
            orderCount: ordersInRange.length,
            liveKdsTickets: kdsTickets,
            lowStockCount: lowStockItems,
            activeTables: activeTables,
        };
    }
    async getRevenueChartData(startDate, endDate) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const filterStart = startDate || thirtyDaysAgo;
        const filterEnd = endDate || new Date();
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                branchId: this.tenantService.getBranchId(),
                createdAt: { gte: filterStart, lte: filterEnd },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
            select: { totalAmount: true, createdAt: true },
        });
        const dailyRevenue = {};
        orders.forEach((o) => {
            const date = o.createdAt.toISOString().split('T')[0];
            dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(o.totalAmount);
        });
        return Object.entries(dailyRevenue)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    async getInventoryStats() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const lowStock = await this.prisma.product.findMany({
            where: {
                tenantId,
                stockLevels: { some: { quantity: { lte: 5 } } }
            },
            include: { stockLevels: true },
            take: 5
        });
        return {
            lowStockItems: lowStock.map((p) => ({
                id: p.id,
                name: p.name,
                stock: p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0)
            }))
        };
    }
    async getSalesReport(startDate, endDate) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                branchId: this.tenantService.getBranchId(),
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
            include: { items: true, refunds: true }
        });
        let totalRevenue = 0;
        let totalCost = 0;
        let totalTax = 0;
        let totalRefunds = 0;
        orders.forEach((o) => {
            totalRevenue += Number(o.totalAmount || 0);
            totalTax += Number(o.taxAmount || 0);
            const refundsForOrder = o.refunds?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
            totalRefunds += refundsForOrder;
            o.items?.forEach((item) => {
                totalCost += Number(item.costPrice || 0) * (item.quantity || 0);
            });
        });
        const netSales = totalRevenue - totalTax - totalRefunds;
        const netProfit = netSales - totalCost;
        return {
            totalRevenue,
            netSales,
            totalCost,
            netProfit,
            orderCount: orders.length,
            averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
            profitMargin: netSales > 0 ? (netProfit / netSales) * 100 : 0
        };
    }
    async getTopProducts(limit = 5) {
        const tenantId = this.tenantService.getTenantId();
        const items = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    tenantId,
                    branchId: this.tenantService.getBranchId(),
                    status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
                }
            },
            include: { product: true }
        });
        const productStats = items.reduce((acc, item) => {
            const productId = item.productId;
            if (!acc[productId]) {
                acc[productId] = { name: item.product.name, quantity: 0, revenue: 0 };
            }
            acc[productId].quantity += item.quantity;
            acc[productId].revenue += Number(item.price) * item.quantity;
            return acc;
        }, {});
        return Object.values(productStats)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }
    async getDailySalesSummary(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
            include: { branch: true, payments: true, refunds: true, items: true }
        });
        const summary = orders.reduce((acc, order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            const key = `${date}_${order.branch?.name || 'Main'}`;
            if (!acc[key]) {
                acc[key] = {
                    report_date: date,
                    branch_name: order.branch?.name || 'Main',
                    register_id: 'REG-01',
                    gross_sales: 0,
                    discounts_total: 0,
                    refunds_total: 0,
                    net_sales: 0,
                    total_cost: 0,
                    net_profit: 0,
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
            const refund = order.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
            let orderCost = 0;
            order.items?.forEach((item) => {
                orderCost += Number(item.costPrice || 0) * (item.quantity || 0);
            });
            const netSales = (amount - tax - refund);
            o.gross_sales += amount;
            o.discounts_total += discount;
            o.refunds_total += refund;
            o.net_sales += netSales;
            o.total_cost += orderCost;
            o.net_profit += (netSales - orderCost);
            o.sales_tax_collected += tax;
            o.order_count += 1;
            o.total_payments += amount - refund;
            o.avg_order_value = o.gross_sales / o.order_count;
            order.payments.forEach((p) => {
                const pAmount = Number(p.amount);
                const method = p.method?.toUpperCase();
                if (method === 'CASH')
                    o.payment_cash += pAmount;
                else if (method === 'CARD' || method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method === 'VISA' || method === 'MASTERCARD')
                    o.payment_card += pAmount;
                else
                    o.other_payments += pAmount;
            });
            order.refunds.forEach((r) => {
                const rAmount = Number(r.amount);
                const method = r.paymentMethod?.toUpperCase() || order.paymentMethod?.toUpperCase();
                if (method === 'CASH')
                    o.payment_cash -= rAmount;
                else if (method === 'CARD' || method === 'CREDIT_CARD' || method === 'DEBIT_CARD' || method === 'VISA' || method === 'MASTERCARD')
                    o.payment_card -= rAmount;
                else
                    o.other_payments -= rAmount;
            });
            return acc;
        }, {});
        if (Object.keys(summary).length === 0) {
            return [];
        }
        return Object.values(summary);
    }
    async getPaymentReconciliation(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const payments = await this.prisma.payment.findMany({
            where: {
                order: { tenantId, ...(branchId ? { branchId } : {}) },
                createdAt: { gte: startDate, lte: endDate },
                status: 'COMPLETED'
            }
        });
        if (payments.length === 0) {
            return [];
        }
        return payments.map((p) => {
            const amount = Number(p.amount);
            const fee = p.method === 'CASH' ? 0 : amount * 0.029 + 0.3;
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
    async getCashDrawerReconciliation(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const sessions = await this.prisma.drawerSession.findMany({
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
        return sessions.map((s) => {
            let cash_sales = 0;
            let cash_refunds = 0;
            let cash_paid_out = 0;
            let cash_drops = 0;
            s.movements.forEach((m) => {
                const amt = Number(m.amount);
                if (m.type === 'CASH_IN')
                    cash_sales += amt;
                else if (m.type === 'CASH_OUT')
                    cash_refunds += amt;
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
    async getInventoryValuation(filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            include: { category: true, stockLevels: { include: { warehouse: { include: { branch: true } } } } }
        });
        if (products.length === 0) {
            return [];
        }
        const valuation = [];
        products.forEach((p) => {
            p.stockLevels.forEach((sl) => {
                const slBranchId = sl.warehouse?.branchId;
                if (branchId && slBranchId && slBranchId !== branchId)
                    return;
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
                    days_on_hand: 30,
                    last_movement_date: sl.updatedAt.toISOString().split('T')[0]
                });
            });
        });
        return valuation;
    }
    async getInventoryMovement(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const movements = await this.prisma.stockMovement.findMany({
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
        return movements.map((m) => ({
            transaction_date: m.createdAt.toISOString().split('T')[0],
            transaction_time: m.createdAt.toTimeString().slice(0, 8),
            branch_name: m.warehouse?.branch?.name || m.warehouse?.name || 'Warehouse',
            product_sku: m.product?.sku || 'N/A',
            product_name: m.product?.name || 'Unknown',
            movement_type: m.type,
            reference_type: m.referenceId || 'N/A',
            qty_change: m.quantity,
            qty_after: m.quantity,
            unit_cost: Number(m.product?.costPrice || 0)
        }));
    }
    async getTaxLiability(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const tenantSettings = await this.prisma.settings.findUnique({ where: { tenantId } });
        const branchSettingsList = await this.prisma.client.branchSettings.findMany({ where: { tenantId } });
        const globalTaxRate = Number(tenantSettings?.taxRate || 0);
        const branchTaxRates = {};
        branchSettingsList.forEach((bs) => {
            if (bs.taxRate !== null && bs.taxRate !== undefined) {
                branchTaxRates[bs.branchId] = Number(bs.taxRate);
            }
        });
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
        });
        const summary = orders.reduce((acc, order) => {
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
    async getCustomerSalesSummary(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
            include: { customer: true }
        });
        const summaryObj = orders.reduce((acc, order) => {
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
        return Object.values(summaryObj).sort((a, b) => b.gross_sales - a.gross_sales);
    }
    async getCashierPerformance(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
            include: { user: { select: { name: true } } }
        });
        const performance = orders.reduce((acc, order) => {
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
        return Object.values(performance).sort((a, b) => b.gross_sales - a.gross_sales);
    }
    async getStaffLeaderboard(startDate, endDate) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        const orders = await this.prisma.order.findMany({
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
        const leaderboard = {};
        orders.forEach((o) => {
            if (!leaderboard[o.userId]) {
                leaderboard[o.userId] = { id: o.userId, name: o.user?.name || 'Unknown', revenue: 0, orderCount: 0 };
            }
            leaderboard[o.userId].revenue += Number(o.totalAmount);
            leaderboard[o.userId].orderCount += 1;
        });
        return Object.values(leaderboard).sort((a, b) => b.revenue - a.revenue);
    }
    async getKDS2Analytics(startDate, endDate) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        const completedItems = await this.prisma.orderItem.findMany({
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
        const hourlyThroughput = {};
        const stationStats = {};
        completedItems.forEach((item) => {
            const hour = item.completedAt.getHours();
            hourlyThroughput[hour] = (hourlyThroughput[hour] || 0) + 1;
            const sId = item.stationId || 'unassigned';
            const sName = item.station?.name || 'Unassigned';
            if (!stationStats[sId]) {
                stationStats[sId] = { name: sName, totalItems: 0, avgPrepMinutes: 0, efficiencyScore: 0, maxPrepMinutes: 0 };
            }
            const prepMs = item.completedAt.getTime() - item.startedAt.getTime();
            const prepMin = prepMs / 60000;
            const targetMin = item.product?.prepTime || 10;
            const stats = stationStats[sId];
            const oldTotal = stats.totalItems;
            stats.totalItems += 1;
            stats.avgPrepMinutes = (stats.avgPrepMinutes * oldTotal + prepMin) / stats.totalItems;
            stats.maxPrepMinutes = Math.max(stats.maxPrepMinutes, prepMin);
            if (prepMin <= targetMin) {
                stats.efficiencyScore += 1;
            }
        });
        Object.values(stationStats).forEach(s => {
            s.efficiencyScore = (s.efficiencyScore / s.totalItems) * 100;
        });
        return {
            totalCompletedItems: completedItems.length,
            hourlyThroughput: Object.entries(hourlyThroughput).map(([hour, count]) => ({ hour: Number(hour), count })),
            stations: Object.values(stationStats).sort((a, b) => b.totalItems - a.totalItems),
            busiestHour: Object.entries(hourlyThroughput).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        };
    }
    async getProductProfitability(startDate, endDate) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.tenantService.getBranchId();
        const items = await this.prisma.orderItem.findMany({
            where: {
                order: {
                    tenantId,
                    ...(branchId ? { branchId } : {}),
                    createdAt: { gte: startDate, lte: endDate },
                    status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
                }
            },
            include: { product: { select: { name: true } } }
        });
        const productStats = {};
        items.forEach((item) => {
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
    async getPeakHours(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
            select: { totalAmount: true, createdAt: true }
        });
        const hourlyStats = Array.from({ length: 24 }, (_, i) => ({ hour: i, orderCount: 0, revenue: 0 }));
        orders.forEach((o) => {
            const hour = o.createdAt.getHours();
            hourlyStats[hour].orderCount += 1;
            hourlyStats[hour].revenue += Number(o.totalAmount);
        });
        return hourlyStats;
    }
    async getBusiestDays(startDate, endDate, filterBranchId) {
        const tenantId = this.tenantService.getTenantId();
        const branchId = this.getQueryBranchId(filterBranchId);
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['COMPLETED', 'READY', 'DELIVERED'] }
            },
            select: { totalAmount: true, createdAt: true }
        });
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayStats = dayNames.map((day, index) => ({ id: index, day, orderCount: 0, revenue: 0 }));
        orders.forEach((o) => {
            const dayIndex = o.createdAt.getDay();
            dayStats[dayIndex].orderCount += 1;
            dayStats[dayIndex].revenue += Number(o.totalAmount);
        });
        return dayStats;
    }
    async pushStatsUpdate(tenantId, branchId) {
        try {
            const overview = await this.getOverview();
            this.dashboardGateway.emitStatsUpdate(tenantId, branchId || null, overview);
        }
        catch (error) {
            console.error('Failed to push dashboard stats update:', error);
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => dashboard_gateway_1.DashboardGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        dashboard_gateway_1.DashboardGateway])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map