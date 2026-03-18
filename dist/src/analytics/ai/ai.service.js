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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let AiService = class AiService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async forecastStock(productId) {
        const tenantId = this.tenantService.getTenantId();
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const [sales30d, inventoryData, product] = await Promise.all([
            this.prisma.orderItem.findMany({
                where: {
                    productId,
                    order: { tenantId, createdAt: { gte: thirtyDaysAgo }, status: 'COMPLETED' },
                },
                select: { quantity: true, createdAt: true }
            }),
            this.prisma.stockLevel.aggregate({
                where: { productId, warehouse: { tenantId } },
                _sum: { quantity: true },
            }),
            this.prisma.product.findUnique({
                where: { id: productId },
                select: { name: true, minStockLevel: true }
            })
        ]);
        const currentStock = inventoryData._sum.quantity || 0;
        const totalSold30d = sales30d.reduce((sum, item) => sum + item.quantity, 0);
        const sales7d = sales30d.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);
        const totalSold7d = sales7d.reduce((sum, item) => sum + item.quantity, 0);
        const avgDaily30d = totalSold30d / 30;
        const avgDaily7d = totalSold7d / 7;
        const trendMultiplier = avgDaily30d > 0 ? avgDaily7d / avgDaily30d : 1;
        const projectedDailySales = avgDaily7d > 0 ? avgDaily7d : avgDaily30d;
        if (projectedDailySales === 0) {
            return { daysRemaining: 'Infinity', status: 'Healthy', confidence: 'Low (No recent sales)' };
        }
        const daysRemaining = currentStock / projectedDailySales;
        const minStock = product?.minStockLevel || 5;
        const confidence = sales30d.length > 20 ? 'High' : (sales30d.length > 5 ? 'Medium' : 'Low');
        return {
            productName: product?.name,
            currentStock,
            avgDailySales: projectedDailySales.toFixed(2),
            daysRemaining: Math.round(daysRemaining),
            trend: trendMultiplier > 1.1 ? 'Upward' : (trendMultiplier < 0.9 ? 'Downward' : 'Stable'),
            status: daysRemaining < 3 ? 'Critical' : (daysRemaining < 7 ? 'Warning' : 'Healthy'),
            recommendedRestock: daysRemaining < 7 ? Math.round(projectedDailySales * 14) : 0,
            confidence
        };
    }
    async predictRevenue(days = 7) {
        const tenantId = this.tenantService.getTenantId();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const orders = await this.prisma.order.findMany({
            where: {
                tenantId,
                createdAt: { gte: thirtyDaysAgo },
                status: 'COMPLETED'
            },
            select: { totalAmount: true, createdAt: true }
        });
        const dailyRevenue = {};
        orders.forEach((o) => {
            const d = o.createdAt.toISOString().split('T')[0];
            dailyRevenue[d] = (dailyRevenue[d] || 0) + Number(o.totalAmount);
        });
        const values = Object.values(dailyRevenue);
        if (values.length === 0)
            return { forecast: [], totalProjected: 0 };
        const avgDaily = values.reduce((a, b) => a + b, 0) / 30;
        const forecast = [];
        let totalProjected = 0;
        const lastDate = new Date();
        for (let i = 1; i <= days; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setDate(lastDate.getDate() + i);
            const amount = avgDaily * (1 + (i * 0.005));
            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                amount: Math.round(amount * 100) / 100
            });
            totalProjected += amount;
        }
        return {
            forecast,
            totalProjected: Math.round(totalProjected * 100) / 100,
            avgDailyHistorical: Math.round(avgDaily * 100) / 100
        };
    }
    async getRecommendations(productId) {
        const tenantId = this.tenantService.getTenantId();
        const ordersWithProduct = await this.prisma.order.findMany({
            where: { tenantId, items: { some: { productId } }, status: 'COMPLETED' },
            include: { items: { select: { productId: true } } },
            take: 100
        });
        const productCounts = {};
        ordersWithProduct.forEach((order) => {
            order.items.forEach((item) => {
                if (item.productId !== productId) {
                    productCounts[item.productId] = (productCounts[item.productId] || 0) + 1;
                }
            });
        });
        const sorted = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        const recommendedIds = sorted.map(([id]) => id);
        return this.prisma.product.findMany({
            where: { id: { in: recommendedIds } },
            select: { id: true, name: true, price: true, imageUrl: true }
        });
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], AiService);
//# sourceMappingURL=ai.service.js.map