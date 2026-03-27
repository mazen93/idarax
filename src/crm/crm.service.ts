import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateCustomerDto, UpdateCustomerDto, LoyaltyTransactionDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, PaginationQueryDto } from './dto/crm.dto';
import { DrovoService } from '../delivery-aggregator/drovo.service';

@Injectable()
export class CrmService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        private drovoService: DrovoService,
    ) { }

    async createCustomer(dto: CreateCustomerDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const { addresses, referredByCode, ...customerData } = dto;

        // Generate a unique 8-character referral string
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        let referredById = null;

        // Process referral link if provided
        if (referredByCode) {
            const referrer = await (this.prisma as any).customer.findUnique({
                where: { referralCode: referredByCode }
            });

            if (referrer && referrer.tenantId === tenantId) {
                referredById = referrer.id;

                // Grant immediate Friend Reward? 
                // Normally referral logic triggers either on signup or first purchase.
                // We'll log the relationship here. Marketing cron/checkout can handle the rest.
            }
        }

        return (this.prisma as any).customer.create({
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

    async getCustomers(query: PaginationQueryDto) {
        const tenantId = this.tenantService.getTenantId();
        const { page = 1, limit = 10, search, segmentId } = query;
        const skip = (page - 1) * limit;

        const where: any = { tenantId };
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

        // Fetch customers with pagination
        const [customers, total] = await Promise.all([
            (this.prisma as any).customer.findMany({
                where,
                include: { loyaltyHistory: true, addresses: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            (this.prisma as any).customer.count({ where }),
        ]);

        // Aggregated stats for these customers
        const customerIds = customers.map((c: any) => c.id);
        const stats = await (this.prisma.client as any).order.groupBy({
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

        // Map stats to customers
        const data = customers.map((c: any) => {
            const s = stats.find((st: any) => st.customerId === c.id);
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

    async getCustomerById(id: string, prisma: any = this.prisma) {
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
            throw new NotFoundException('Customer not found');
        }

        const completedOrders = customer.orders;
        const totalSpent = completedOrders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);
        const ordersCount = completedOrders.length;
        const lastOrderDate = completedOrders[0]?.createdAt || null;
        const firstOrderDate = completedOrders[completedOrders.length - 1]?.createdAt || null;

        const aov = ordersCount > 0 ? totalSpent / ordersCount : 0;

        // Calculate favorite products and categories
        const productCounts: Record<string, { name: string, count: number }> = {};
        const categoryCounts: Record<string, { name: string, count: number }> = {};

        completedOrders.forEach((order: any) => {
            order.items.forEach((item: any) => {
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

        // Visit frequency (days between orders)
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

    async updateCustomer(id: string, dto: UpdateCustomerDto) {
        await this.getCustomerById(id); // Validation
        const { addresses, ...customerData } = dto;

        return (this.prisma as any).$transaction(async (tx: any) => {
            // Update basic info
            const updatedCustomer = await tx.customer.update({
                where: { id },
                data: customerData,
            });

            // Update addresses if provided
            if (addresses) {
                // Delete existing addresses and recreate (Sync strategy)
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

    async deleteCustomer(id: string) {
        await this.getCustomerById(id); // Validation
        return (this.prisma as any).customer.delete({
            where: { id },
        });
    }

    async addLoyaltyTransaction(dto: LoyaltyTransactionDto) {
        const tenantId = this.tenantService.getTenantId();
        const customer = await this.getCustomerById(dto.customerId);

        return (this.prisma as any).$transaction(async (tx: any) => {
            // Create history entry
            const history = await tx.customerLoyalty.create({
                data: {
                    ...dto,
                },
            });

            // Update customer balance
            const newPoints = dto.type === 'EARNED'
                ? customer.points + dto.points
                : customer.points - dto.points;

            if (newPoints < 0) throw new ForbiddenException('Insufficient points');

            await tx.customer.update({
                where: { id: dto.customerId },
                data: { points: newPoints },
            });

            return history;
        });
    }

    async createAddress(dto: CreateCustomerAddressDto) {
        await this.getCustomerById(dto.customerId); // Validation
        return (this.prisma as any).customerAddress.create({
            data: dto,
        });
    }

    async updateAddress(id: string, dto: UpdateCustomerAddressDto) {
        return (this.prisma as any).customerAddress.update({
            where: { id },
            data: dto,
        });
    }

    async deleteAddress(id: string) {
        return (this.prisma as any).customerAddress.delete({
            where: { id },
        });
    }

    async processLoyaltyForOrder(customerId: string, orderAmount: number, orderId: string, prisma: any = this.prisma) {
        const customer = await this.getCustomerById(customerId, prisma);

        const amount = Number(orderAmount);
        const newTotalSpend = Number(customer.totalSpend || 0) + amount;

        // Determine new tier
        let newTier = customer.loyaltyTier;
        if (newTotalSpend >= 5000) newTier = 'GOLD';
        else if (newTotalSpend >= 1000) newTier = 'SILVER';
        else newTier = 'BRONZE';

        // Fetch dynamic tenant earning ratio
        const tenantSettings = await prisma.settings.findUnique({
            where: { tenantId: customer.tenantId }
        });
        const earningRatio = tenantSettings?.loyaltyRatioEarning || 1.0;

        let multiplier = 1;
        if (customer.loyaltyTier === 'GOLD') multiplier = 2.0;
        else if (customer.loyaltyTier === 'SILVER') multiplier = 1.5;

        // Base earn formula: Amount * Ratio * Multiplier
        const pointsToEarn = Math.floor(amount * Number(earningRatio) * multiplier);

        const updateData = async (activeTx: any) => {
            // Update customer spend and tier
            await activeTx.customer.update({
                where: { id: customerId },
                data: {
                    totalSpend: newTotalSpend,
                    loyaltyTier: newTier,
                    points: { increment: pointsToEarn }
                }
            });

            // Log point transaction
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

            // --- Referral Reward Logic ---
            const currentOrderCount = (customer.orders?.length || 0) + 1; // +1 for the current order being processed
            if (customer.referredById && currentOrderCount === 1) { 
                const rule = await activeTx.marketingCampaignRule.findUnique({
                    where: { tenantId: customer.tenantId }
                });

                if (rule && rule.referralActive) {
                    const referrerReward = Number(rule.referralReward || 0);
                    const friendReward = Number(rule.referralFriendReward || 0);

                    // Reward Referrer
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

                    // Reward Friend (the new customer)
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
                    
                    // Unlink to prevent duplicate processing
                    await activeTx.customer.update({
                        where: { id: customerId },
                        data: { referredById: null }
                    });
                }
            }
            return { newTier, pointsEarned: pointsToEarn };
        };

        // If a transaction client is provided, use it. Otherwise, start a new transaction.
        // Check if the provided prisma object is a transaction client (doesn't have $transaction itself)
        if (prisma && (prisma as any).$transaction === undefined) {
            return updateData(prisma);
        } else {
            return (this.prisma as any).$transaction(async (tx: any) => {
                return updateData(tx);
            });
        }
    }

    async getActiveCampaigns() {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).marketingCampaign.findMany({
            where: { tenantId },
            include: { customer: { select: { id: true, name: true, phone: true } } },
            orderBy: { sentAt: 'desc' },
            take: 50
        });
    }

    async estimateDeliveryFee(addressId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const address = await (this.prisma as any).customerAddress.findUnique({
            where: { id: addressId },
            include: { customer: true }
        });

        if (!address || address.customer.tenantId !== tenantId) {
            throw new NotFoundException('Customer address not found');
        }

        const feeEstimate = await this.drovoService.getDeliveryFeeEstimate(
            tenantId,
            address.address,
            address.lat,
            address.lng
        );

        if (!feeEstimate) {
            throw new Error('Failed to estimate delivery fee with Drovo');
        }

        return feeEstimate;
    }

    // --- Customer Segmentation Logic ---

    async createSegment(dto: any) {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).customerSegment.create({
            data: { ...dto, tenantId }
        });
    }

    async getSegments() {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).customerSegment.findMany({
            where: { tenantId },
            include: { _count: { select: { customers: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async updateSegment(id: string, dto: any) {
        return (this.prisma as any).customerSegment.update({
            where: { id },
            data: dto
        });
    }

    async deleteSegment(id: string) {
        return (this.prisma as any).customerSegment.delete({
            where: { id }
        });
    }

    async assignCustomersToSegment(segmentId: string, customerIds: string[]) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma as any).customerSegment.update({
            where: { id: segmentId },
            data: {
                customers: {
                    connect: customerIds.map(id => ({ id }))
                }
            }
        });
    }

    // --- Reward Catalog Logic ---

    async createRewardCatalogItem(dto: any) {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).rewardCatalogItem.create({
            data: { ...dto, tenantId }
        });
    }

    async getRewardCatalogItems() {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).rewardCatalogItem.findMany({
            where: { tenantId },
            include: { product: true },
            orderBy: { pointsCost: 'asc' }
        });
    }

    async updateRewardCatalogItem(id: string, dto: any) {
        return (this.prisma as any).rewardCatalogItem.update({
            where: { id },
            data: dto
        });
    }

    async deleteRewardCatalogItem(id: string) {
        return (this.prisma as any).rewardCatalogItem.delete({
            where: { id }
        });
    }
}
