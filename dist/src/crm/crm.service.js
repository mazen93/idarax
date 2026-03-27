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
const drovo_service_1 = require("../delivery-aggregator/drovo.service");
let CrmService = class CrmService {
    prisma;
    tenantService;
    drovoService;
    constructor(prisma, tenantService, drovoService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.drovoService = drovoService;
    }
    async createCustomer(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const { addresses, referredByCode, ...customerData } = dto;
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        let referredById = null;
        if (referredByCode) {
            const referrer = await this.prisma.customer.findUnique({
                where: { referralCode: referredByCode }
            });
            if (referrer && referrer.tenantId === tenantId) {
                referredById = referrer.id;
            }
        }
        return this.prisma.customer.create({
            data: {
                ...customerData,
                tenantId,
                referralCode,
                referredById,
                addresses: addresses ? {
                    create: addresses.map(addr => ({
                        label: addr.label || 'Home',
                        address: addr.address,
                        isDefault: addr.isDefault || false,
                        lat: addr.lat,
                        lng: addr.lng,
                    }))
                } : undefined,
            },
            include: { addresses: true }
        });
    }
    async getCustomers(query) {
        const tenantId = this.tenantService.getTenantId();
        const { page = 1, limit = 10, search, segmentId } = query;
        const skip = (page - 1) * limit;
        const where = { tenantId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }
        if (segmentId) {
            where.segments = { some: { id: segmentId } };
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
                        lat: addr.lat,
                        lng: addr.lng,
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
    async processLoyaltyForOrder(customerId, orderAmount, orderId, prisma = this.prisma) {
        const customer = await this.getCustomerById(customerId, prisma);
        const amount = Number(orderAmount);
        const newTotalSpend = Number(customer.totalSpend || 0) + amount;
        let newTier = customer.loyaltyTier;
        if (newTotalSpend >= 5000)
            newTier = 'GOLD';
        else if (newTotalSpend >= 1000)
            newTier = 'SILVER';
        else
            newTier = 'BRONZE';
        const tenantSettings = await prisma.settings.findUnique({
            where: { tenantId: customer.tenantId }
        });
        const earningRatio = tenantSettings?.loyaltyRatioEarning || 1.0;
        let multiplier = 1;
        if (customer.loyaltyTier === 'GOLD')
            multiplier = 2.0;
        else if (customer.loyaltyTier === 'SILVER')
            multiplier = 1.5;
        const pointsToEarn = Math.floor(amount * Number(earningRatio) * multiplier);
        const updateData = async (activeTx) => {
            await activeTx.customer.update({
                where: { id: customerId },
                data: {
                    totalSpend: newTotalSpend,
                    loyaltyTier: newTier,
                    points: { increment: pointsToEarn }
                }
            });
            if (pointsToEarn > 0) {
                await activeTx.customerLoyalty.create({
                    data: {
                        customerId,
                        points: pointsToEarn,
                        type: 'EARNED',
                        description: `Points earned for order #${orderId} (${customer.loyaltyTier} multiplier: ${multiplier}x)`,
                    }
                });
            }
            const currentOrderCount = (customer.orders?.length || 0) + 1;
            if (customer.referredById && currentOrderCount === 1) {
                const rule = await activeTx.marketingCampaignRule.findUnique({
                    where: { tenantId: customer.tenantId }
                });
                if (rule && rule.referralActive) {
                    const referrerReward = Number(rule.referralReward || 0);
                    const friendReward = Number(rule.referralFriendReward || 0);
                    if (referrerReward > 0) {
                        await activeTx.customer.update({
                            where: { id: customer.referredById },
                            data: { points: { increment: referrerReward } }
                        });
                        await activeTx.customerLoyalty.create({
                            data: {
                                customerId: customer.referredById,
                                points: referrerReward,
                                type: 'EARNED',
                                description: `Referral bonus for inviting ${customer.name}`,
                            }
                        });
                    }
                    if (friendReward > 0) {
                        await activeTx.customer.update({
                            where: { id: customerId },
                            data: { points: { increment: friendReward } }
                        });
                        await activeTx.customerLoyalty.create({
                            data: {
                                customerId,
                                points: friendReward,
                                type: 'EARNED',
                                description: `Welcome bonus from referral`,
                            }
                        });
                    }
                    await activeTx.customer.update({
                        where: { id: customerId },
                        data: { referredById: null }
                    });
                }
            }
            return { newTier, pointsEarned: pointsToEarn };
        };
        if (prisma && prisma.$transaction === undefined) {
            return updateData(prisma);
        }
        else {
            return this.prisma.$transaction(async (tx) => {
                return updateData(tx);
            });
        }
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
    async estimateDeliveryFee(addressId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const address = await this.prisma.customerAddress.findUnique({
            where: { id: addressId },
            include: { customer: true }
        });
        if (!address || address.customer.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Customer address not found');
        }
        const feeEstimate = await this.drovoService.getDeliveryFeeEstimate(tenantId, address.address, address.lat, address.lng);
        if (!feeEstimate) {
            throw new Error('Failed to estimate delivery fee with Drovo');
        }
        return feeEstimate;
    }
    async createSegment(dto) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.customerSegment.create({
            data: { ...dto, tenantId }
        });
    }
    async getSegments() {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.customerSegment.findMany({
            where: { tenantId },
            include: { _count: { select: { customers: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateSegment(id, dto) {
        return this.prisma.customerSegment.update({
            where: { id },
            data: dto
        });
    }
    async deleteSegment(id) {
        return this.prisma.customerSegment.delete({
            where: { id }
        });
    }
    async assignCustomersToSegment(segmentId, customerIds) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.customerSegment.update({
            where: { id: segmentId },
            data: {
                customers: {
                    connect: customerIds.map(id => ({ id }))
                }
            }
        });
    }
    async createRewardCatalogItem(dto) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.rewardCatalogItem.create({
            data: { ...dto, tenantId }
        });
    }
    async getRewardCatalogItems() {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.rewardCatalogItem.findMany({
            where: { tenantId },
            include: { product: true },
            orderBy: { pointsCost: 'asc' }
        });
    }
    async updateRewardCatalogItem(id, dto) {
        return this.prisma.rewardCatalogItem.update({
            where: { id },
            data: dto
        });
    }
    async deleteRewardCatalogItem(id) {
        return this.prisma.rewardCatalogItem.delete({
            where: { id }
        });
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        drovo_service_1.DrovoService])
], CrmService);
//# sourceMappingURL=crm.service.js.map