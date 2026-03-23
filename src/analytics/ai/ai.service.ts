import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';

@Injectable()
export class AiService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async forecastStock(productId: string) {
        const tenantId = this.tenantService.getTenantId();
        const now = new Date();
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);

        const [sales30d, inventoryData, product] = await Promise.all([
            (this.prisma as any).orderItem.findMany({
                where: {
                    productId,
                    order: { tenantId, createdAt: { gte: thirtyDaysAgo }, status: 'COMPLETED' },
                },
                select: { quantity: true, createdAt: true }
            }),
            (this.prisma as any).stockLevel.aggregate({
                where: { productId, warehouse: { tenantId } },
                _sum: { quantity: true },
            }),
            (this.prisma as any).product.findUnique({
                where: { id: productId },
                select: { name: true, minStockLevel: true }
            })
        ]);

        const currentStock = inventoryData._sum.quantity || 0;
        const totalSold30d = sales30d.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const sales7d = sales30d.filter((s: any) => new Date(s.createdAt) >= sevenDaysAgo);
        const totalSold7d = sales7d.reduce((sum: number, item: any) => sum + item.quantity, 0);

        const avgDaily30d = totalSold30d / 30;
        const avgDaily7d = totalSold7d / 7;

        // Trend detection: is demand growing or shrinking?
        const trendMultiplier = avgDaily30d > 0 ? avgDaily7d / avgDaily30d : 1;
        const projectedDailySales = avgDaily7d > 0 ? avgDaily7d : avgDaily30d;

        if (projectedDailySales === 0) {
            return { daysRemaining: 'Infinity', status: 'Healthy', confidence: 'Low (No recent sales)' };
        }

        const daysRemaining = currentStock / projectedDailySales;
        const minStock = product?.minStockLevel || 5;

        // Simple confidence calculation based on data density
        const confidence = sales30d.length > 20 ? 'High' : (sales30d.length > 5 ? 'Medium' : 'Low');

        return {
            productName: product?.name,
            currentStock,
            avgDailySales: projectedDailySales.toFixed(2),
            daysRemaining: Math.round(daysRemaining),
            trend: trendMultiplier > 1.1 ? 'Upward' : (trendMultiplier < 0.9 ? 'Downward' : 'Stable'),
            status: daysRemaining < 3 ? 'Critical' : (daysRemaining < 7 ? 'Warning' : 'Healthy'),
            recommendedRestock: daysRemaining < 7 ? Math.round(projectedDailySales * 14) : 0, // Restock for 2 weeks
            confidence
        };
    }

    /**
     * Predicts revenue for next N days based on historical trends.
     */
    async predictRevenue(days: number = 7) {
        const tenantId = this.tenantService.getTenantId();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await (this.prisma as any).order.findMany({
            where: {
                tenantId,
                createdAt: { gte: thirtyDaysAgo },
                status: 'COMPLETED'
            },
            select: { totalAmount: true, createdAt: true }
        });

        // Group by day for the last 30 days
        const dailyRevenue: Record<string, number> = {};
        orders.forEach((o: any) => {
            const d = o.createdAt.toISOString().split('T')[0];
            dailyRevenue[d] = (dailyRevenue[d] || 0) + Number(o.totalAmount);
        });

        const values = Object.values(dailyRevenue);
        if (values.length === 0) return { forecast: [], totalProjected: 0 };

        const avgDaily = values.reduce((a, b) => a + b, 0) / 30;
        
        // Very simple linear projection with 2% growth assumption if data is positive
        const forecast = [];
        let totalProjected = 0;
        const lastDate = new Date();

        for (let i = 1; i <= days; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setDate(lastDate.getDate() + i);
            const amount = avgDaily * (1 + (i * 0.005)); // 0.5% growth per day mock
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

    /**
     * Product recommendations based on "Frequently Bought Together"
     */
    async getRecommendations(productId: string) {
        return this.getUpsellRecommendations([productId]);
    }

    /**
     * Product recommendations for multiple items in a cart
     */
    async getUpsellRecommendations(productIds: string[]) {
        if (!productIds || productIds.length === 0) return [];
        
        const tenantId = this.tenantService.getTenantId();

        // Find orders containing ANY of the cart's product IDs
        const ordersWithProducts = await (this.prisma as any).order.findMany({
            where: { 
                tenantId, 
                items: { some: { productId: { in: productIds } } }, 
                status: 'COMPLETED' 
            },
            include: { items: { select: { productId: true } } },
            take: 200 // Look at recent 200 orders for relevance
        });

        const productCounts: Record<string, number> = {};
        
        // Tally up items in those orders, excluding items already in the cart
        ordersWithProducts.forEach((order: any) => {
            order.items.forEach((item: any) => {
                if (!productIds.includes(item.productId)) {
                    productCounts[item.productId] = (productCounts[item.productId] || 0) + 1;
                }
            });
        });

        // Sort by frequency and take top 5
        const sorted = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const recommendedIds = sorted.map(([id]) => id);
        
        if (recommendedIds.length === 0) return [];

        return (this.prisma as any).product.findMany({
            where: { id: { in: recommendedIds } },
            select: { id: true, name: true, price: true }
        });
    }

    /**
     * Predictive Inventory: Recommends restock quantities based on sales velocity
     */
    async getInventoryPredictions() {
        const tenantId = this.tenantService.getTenantId();
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // 1. Get all products for the tenant
        const products = await (this.prisma as any).product.findMany({
            where: { tenantId, isActive: true },
            select: { id: true, name: true, minStockLevel: true, price: true }
        });

        // 2. Get sales for the last 14 days for all these products
        const sales = await (this.prisma as any).orderItem.findMany({
            where: {
                order: { tenantId, createdAt: { gte: fourteenDaysAgo }, status: 'COMPLETED' }
            },
            select: { productId: true, quantity: true }
        });

        // 3. Get current stock levels for all products
        const stockLevels = await (this.prisma as any).stockLevel.findMany({
            where: { warehouse: { tenantId } },
            select: { productId: true, quantity: true }
        });

        // Tally current stock per product
        const stockMap: Record<string, number> = {};
        stockLevels.forEach((s: any) => {
            stockMap[s.productId] = (stockMap[s.productId] || 0) + s.quantity;
        });

        // Tally sales per product
        const salesMap: Record<string, number> = {};
        sales.forEach((s: any) => {
            salesMap[s.productId] = (salesMap[s.productId] || 0) + s.quantity;
        });

        const predictions = products.map((product: any) => {
            const currentStock = stockMap[product.id] || 0;
            const totalSold14d = salesMap[product.id] || 0;
            const avgDailySales = totalSold14d / 14;

            // We only care about items that are low or have sales velocity
            if (avgDailySales === 0 && currentStock > (product.minStockLevel || 5)) {
                return null;
            }

            const daysRemaining = avgDailySales > 0 ? currentStock / avgDailySales : (currentStock > 0 ? 99 : 0);
            
            // Restock threshold: less than 7 days of stock left OR below minimum threshold
            const isBelowMin = currentStock <= (product.minStockLevel || 5);
            const isRunningOut = daysRemaining < 7;
            
            if (!isBelowMin && !isRunningOut) return null;

            // Recommended restock: Amount needed for next 14 days
            const recommendedRestock = Math.max(10, Math.round(avgDailySales * 14));

            return {
                id: product.id,
                name: product.name,
                currentStock,
                avgDailySales: avgDailySales.toFixed(2),
                daysRemaining: daysRemaining >= 99 ? '∞' : Math.round(daysRemaining),
                recommendedRestock,
                status: (daysRemaining < 3 || isBelowMin) ? 'CRITICAL' : 'WARNING'
            };
        }).filter(Boolean);

        return predictions;
    }
}
