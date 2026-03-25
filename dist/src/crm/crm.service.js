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
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
let CrmService = class CrmService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async createCustomer(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const { addresses, ...customerData } = dto;
        return this.prisma.customer.create({
            data: {
                ...customerData,
                tenantId,
                addresses: addresses ? {
                    create: addresses.map(addr => ({
                        label: addr.label || 'Home',
                        address: addr.address,
                        isDefault: addr.isDefault || false,
                    }))
                } : undefined,
            },
            include: { addresses: true }
        });
    }
    async getCustomers(query) {
        const tenantId = this.tenantService.getTenantId();
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                include: { loyaltyHistory: true, addresses: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.customer.count({ where }),
        ]);
        const customerIds = customers.map((c) => c.id);
        const stats = await this.prisma.client.order.groupBy({
            by: ['customerId'],
            where: {
                tenantId,
                customerId: { in: customerIds },
                status: 'COMPLETED'
            },
            _sum: { totalAmount: true },
            _count: { id: true },
            _max: { createdAt: true },
        });
        const data = customers.map((c) => {
            const s = stats.find((st) => st.customerId === c.id);
            return {
                ...c,
                totalSpent: s?._sum?.totalAmount || 0,
                ordersCount: s?._count?.id || 0,
                lastOrderDate: s?._max?.createdAt || null,
            };
        });
        return {
            data,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            }
        };
    }
    async getCustomerById(id, prisma = this.prisma) {
        const tenantId = this.tenantService.getTenantId();
        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                loyaltyHistory: { orderBy: { createdAt: 'desc' } },
                addresses: { orderBy: { createdAt: 'desc' } },
                orders: {
                    where: { status: 'COMPLETED' },
                    include: { items: { include: { product: { include: { category: true } } } } },
                    orderBy: { createdAt: 'desc' }
                }
            },
        });
        if (!customer || customer.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const completedOrders = customer.orders;
        const totalSpent = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const ordersCount = completedOrders.length;
        const lastOrderDate = completedOrders[0]?.createdAt || null;
        const firstOrderDate = completedOrders[completedOrders.length - 1]?.createdAt || null;
        const aov = ordersCount > 0 ? totalSpent / ordersCount : 0;
        const productCounts = {};
        const categoryCounts = {};
        completedOrders.forEach((order) => {
            order.items.forEach((item) => {
                const productId = item.productId;
                const productName = item.product.name;
                const categoryId = item.product.categoryId;
                const categoryName = item.product.category.name;
                productCounts[productId] = {
                    name: productName,
                    count: (productCounts[productId]?.count || 0) + item.quantity
                };
                categoryCounts[categoryId] = {
                    name: categoryName,
                    count: (categoryCounts[categoryId]?.count || 0) + item.quantity
                };
            });
        });
        const topProducts = Object.values(productCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const topCategories = Object.values(categoryCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
        let avgDaysBetweenOrders = 0;
        if (ordersCount > 1 && firstOrderDate && lastOrderDate) {
            const diffTime = Math.abs(lastOrderDate.getTime() - firstOrderDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            avgDaysBetweenOrders = diffDays / (ordersCount - 1);
        }
        return {
            ...customer,
            totalSpent,
            ordersCount,
            lastOrderDate,
            insights: {
                totalSpent,
                ordersCount,
                lastOrderDate,
                aov,
                avgDaysBetweenOrders,
                topProducts,
                topCategories,
                loyaltyPoints: customer.points,
            }
        };
    }
    async updateCustomer(id, dto) {
        await this.getCustomerById(id);
        const { addresses, ...customerData } = dto;
        return this.prisma.$transaction(async (tx) => {
            const updatedCustomer = await tx.customer.update({
                where: { id },
                data: customerData,
            });
            if (addresses) {
                await tx.customerAddress.deleteMany({ where: { customerId: id } });
                await tx.customerAddress.createMany({
                    data: addresses.map(addr => ({
                        customerId: id,
                        label: addr.label || 'Home',
                        address: addr.address,
                        isDefault: addr.isDefault || false,
                    }))
                });
            }
            return this.getCustomerById(id, tx);
        });
    }
    async deleteCustomer(id) {
        await this.getCustomerById(id);
        return this.prisma.customer.delete({
            where: { id },
        });
    }
    async addLoyaltyTransaction(dto) {
        const tenantId = this.tenantService.getTenantId();
        const customer = await this.getCustomerById(dto.customerId);
        return this.prisma.$transaction(async (tx) => {
            const history = await tx.customerLoyalty.create({
                data: {
                    ...dto,
                },
            });
            const newPoints = dto.type === 'EARNED'
                ? customer.points + dto.points
                : customer.points - dto.points;
            if (newPoints < 0)
                throw new common_1.ForbiddenException('Insufficient points');
            await tx.customer.update({
                where: { id: dto.customerId },
                data: { points: newPoints },
            });
            return history;
        });
    }
    async createAddress(dto) {
        await this.getCustomerById(dto.customerId);
        return this.prisma.customerAddress.create({
            data: dto,
        });
    }
    async updateAddress(id, dto) {
        return this.prisma.customerAddress.update({
            where: { id },
            data: dto,
        });
    }
    async deleteAddress(id) {
        return this.prisma.customerAddress.delete({
            where: { id },
        });
    }
    async processLoyaltyForOrder(customerId, orderAmount, orderId) {
        const customer = await this.getCustomerById(customerId);
        const amount = Number(orderAmount);
        const newTotalSpend = Number(customer.totalSpend || 0) + amount;
        let newTier = customer.loyaltyTier;
        if (newTotalSpend >= 5000)
            newTier = 'GOLD';
        else if (newTotalSpend >= 1000)
            newTier = 'SILVER';
        else
            newTier = 'BRONZE';
        let multiplier = 1;
        if (customer.loyaltyTier === 'GOLD')
            multiplier = 1.5;
        else if (customer.loyaltyTier === 'SILVER')
            multiplier = 1.2;
        const pointsToEarn = Math.floor((amount / 10) * multiplier);
        return this.prisma.$transaction(async (tx) => {
            await tx.customer.update({
                where: { id: customerId },
                data: {
                    totalSpend: newTotalSpend,
                    loyaltyTier: newTier,
                    points: { increment: pointsToEarn }
                }
            });
            if (pointsToEarn > 0) {
                await tx.customerLoyalty.create({
                    data: {
                        customerId,
                        points: pointsToEarn,
                        type: 'EARNED',
                        description: `Points earned for order #${orderId} (${customer.loyaltyTier} multiplier: ${multiplier}x)`,
                    }
                });
            }
            return { newTier, pointsEarned: pointsToEarn };
        });
    }
    async getActiveCampaigns() {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.marketingCampaign.findMany({
            where: { tenantId },
            include: { customer: { select: { id: true, name: true, phone: true } } },
            orderBy: { sentAt: 'desc' },
            take: 50
        });
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], CrmService);
//# sourceMappingURL=crm.service.js.map