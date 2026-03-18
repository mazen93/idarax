import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateCustomerDto, UpdateCustomerDto, LoyaltyTransactionDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, PaginationQueryDto } from './dto/crm.dto';

@Injectable()
export class CrmService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async createCustomer(dto: CreateCustomerDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const { addresses, ...customerData } = dto;

        return (this.prisma as any).customer.create({
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

    async getCustomers(query: PaginationQueryDto) {
        const tenantId = this.tenantService.getTenantId();
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const where: any = { tenantId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
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

    async processLoyaltyForOrder(customerId: string, orderAmount: number, orderId: string) {
        const customer = await this.getCustomerById(customerId);

        const amount = Number(orderAmount);
        const newTotalSpend = Number(customer.totalSpend || 0) + amount;

        // Determine new tier
        let newTier = customer.loyaltyTier;
        if (newTotalSpend >= 5000) newTier = 'GOLD';
        else if (newTotalSpend >= 1000) newTier = 'SILVER';
        else newTier = 'BRONZE';

        // Calculate points based on tier multiplier
        // Base: 1 point per 10 units
        let multiplier = 1;
        if (customer.loyaltyTier === 'GOLD') multiplier = 1.5;
        else if (customer.loyaltyTier === 'SILVER') multiplier = 1.2;

        const pointsToEarn = Math.floor((amount / 10) * multiplier);

        return (this.prisma as any).$transaction(async (tx: any) => {
            // Update customer spend and tier
            await tx.customer.update({
                where: { id: customerId },
                data: {
                    totalSpend: newTotalSpend,
                    loyaltyTier: newTier,
                    points: { increment: pointsToEarn }
                }
            });

            // Log point transaction
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
}
