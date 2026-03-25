import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class PublicService {
    constructor(private prisma: PrismaService) { }

    async getTenantBranding(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                settings: true,
            },
        });

        if (!tenant) {
            throw new NotFoundException('Restaurant not found');
        }

        return {
            id: tenant.id,
            name: tenant.name,
            type: tenant.type,
            logoUrl: tenant.settings?.logoUrl,
            currency: tenant.settings?.currency || 'USD',
            taxRate: tenant.settings?.taxRate,
            serviceFee: tenant.settings?.serviceFee,
            // New Branding Fields
            aboutUsText: tenant.settings?.aboutUsText,
            bannerImageUrl: tenant.settings?.bannerImageUrl,
            facebookUrl: tenant.settings?.facebookUrl,
            instagramUrl: tenant.settings?.instagramUrl,
            twitterUrl: tenant.settings?.twitterUrl,
            contactEmail: tenant.settings?.contactEmail,
            contactPhone: tenant.settings?.contactPhone,
        };
    }

    async getBranches(tenantId: string) {
        const branches = await this.prisma.branch.findMany({
            where: {
                tenantId,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                nameAr: true,
                address: true,
                phone: true,
            },
            orderBy: { name: 'asc' },
        });

        return branches;
    }

    async getMenu(tenantId: string, branchId?: string) {
        const categories = await this.prisma.category.findMany({
            where: { tenantId },
            include: {
                products: {
                    where: {
                        isSellable: true,
                        // If a branch is specified, ensure it's available there
                        ...(branchId ? {
                            branchSettings: {
                                some: {
                                    branchId,
                                    isAvailable: true,
                                }
                            }
                        } : {})
                    },
                    include: {
                        variants: true,
                        // Include branch settings to fetch price overrides if branchId exists
                        ...(branchId ? {
                            branchSettings: {
                                where: { branchId }
                            }
                        } : {})
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return categories.map(cat => ({
            ...cat,
            products: cat.products.map(p => {
                // Apply optional price override from the branch settings
                let effectivePrice = Number(p.price);
                if (branchId && p.branchSettings && p.branchSettings.length > 0) {
                    const override = p.branchSettings[0].priceOverride;
                    if (override !== null && override !== undefined) {
                        effectivePrice = Number(override);
                    }
                }

                return {
                    id: p.id,
                    name: p.name,
                    nameAr: p.nameAr,
                    description: p.description,
                    descriptionAr: p.descriptionAr,
                    price: effectivePrice,
                    costPrice: Number(p.costPrice),
                    variants: p.variants,
                };
            }),
        })).filter(cat => cat.products.length > 0);
    }

    async createGuestOrder(tenantId: string, dto: CreatePublicOrderDto) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { settings: true }
        });

        if (!tenant) throw new NotFoundException('Tenant not found');

        // 1. Customer Integration: Look up or create customer by phone
        let customerId = null;
        if (dto.customerPhone) {
            let customer = await this.prisma.customer.findFirst({
                where: { 
                    phone: dto.customerPhone,
                    tenantId: tenantId
                }
            });

            if (!customer) {
                // Check if phone exists at all (since it's unique globally in schema)
                const existingPhone = await this.prisma.customer.findUnique({
                    where: { phone: dto.customerPhone }
                });

                if (!existingPhone) {
                    customer = await this.prisma.customer.create({
                        data: {
                            name: dto.customerName,
                            phone: dto.customerPhone,
                            tenantId: tenantId,
                        }
                    });
                    customerId = customer.id;
                } else {
                    // Phone exists for another tenant, link if possible or just use guest details
                    // For now, we link if same tenant, otherwise we just leave as guest
                    if (existingPhone.tenantId === tenantId) {
                        customerId = existingPhone.id;
                    }
                }
            } else {
                customerId = customer.id;
            }
        }

        // 2. Financial Calculations
        const taxRate = Number(tenant.settings?.taxRate || 0);
        const serviceFeeRate = Number(tenant.settings?.serviceFee || 0);
        
        const subtotal = Number(dto.totalAmount);
        const serviceFeeAmount = (dto.orderType === 'DINE_IN') ? (subtotal * (serviceFeeRate / 100)) : 0;
        const taxAmount = (subtotal + serviceFeeAmount) * (taxRate / 100);
        const finalTotal = subtotal + taxAmount + serviceFeeAmount;

        // 3. Create Order
        const order = await (this.prisma as any).order.create({
            data: {
                tenantId,
                customerId,
                totalAmount: finalTotal,
                taxAmount,
                serviceFeeAmount,
                guestName: dto.customerName,
                guestPhone: dto.customerPhone,
                tableId: dto.tableId || undefined,
                branchId: dto.branchId || undefined, 
                orderType: (dto.orderType === 'PICKUP' ? 'TAKEAWAY' : (dto.orderType || 'IN_STORE')) as any,
                source: (dto.source === 'WEB_STORE' ? 'MOBILE_APP' : (dto.source || 'QR_CODE')) as any, 
                note: dto.note,
                status: 'PENDING',
                items: {
                    create: dto.items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        // 4. Update Table Status if applicable
        if (dto.tableId) {
            await (this.prisma as any).table.update({
                where: { id: dto.tableId },
                data: { status: 'OCCUPIED' }
            }).catch((err: any) => console.error('Failed to update table status:', err));
        }

        return order;
    }

    async generateTableQr(tenantId: string, tableId: string) {
        // Find table to ensure it exists and belongs to the tenant
        const table = await (this.prisma as any).table.findUnique({
            where: { id: tableId },
        });

        if (!table || table.tenantId !== tenantId) {
            throw new NotFoundException('Table not found');
        }

        // Deep link URL (usually points to the frontend customer mobile page)
        // e.g. https://idarax.com/m/[tenantId]?table=[tableId]
        const baseUrl = process.env.FRONTEND_PUBLIC_URL || 'https://idarax.com';
        const deepLink = `${baseUrl}/m/${tenantId}?table=${tableId}`;

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(deepLink);

        return {
            tableNumber: table.number,
            deepLink,
            qrCodeDataUrl,
        };
    }

    async createOrderFeedback(orderId: string, dto: { rating: number, comment?: string }) {
        const order = await (this.prisma as any).order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return (this.prisma as any).orderFeedback.create({
            data: {
                orderId,
                tenantId: order.tenantId,
                rating: dto.rating,
                comment: dto.comment,
            },
        });
    }

    async getTableOrder(tableId: string) {
        const order = await (this.prisma as any).order.findFirst({
            where: {
                tableId,
                status: { in: ['PENDING', 'PREPARING', 'READY', 'HELD'] }
            },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, price: true } }
                    }
                },
                tenant: { select: { name: true, id: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!order) return null; // Return null instead of throwing 404
        return order;
    }

    async getTable(id: string) {
        const table = await (this.prisma as any).table.findUnique({
            where: { id },
            include: {
                section: {
                    select: { branchId: true }
                }
            }
        });

        if (!table) throw new NotFoundException('Table not found');
        return {
            id: table.id,
            number: table.number,
            branchId: table.section?.branchId || table.branchId || null
        };
    }

    async splitOrder(orderId: string, dto: SplitBillDto) {
        // Reuse the logic from OrderService but with public access
        // For simplicity, we can just call order services or just re-implement.
        // I'll re-implement the simple version here to avoid service circular deps if any.
        const order = await (this.prisma as any).order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) throw new NotFoundException('Order not found');

        const results = [];
        if (dto.splitType === 'EQUAL') {
            const splitAmount = Number(order.totalAmount) / dto.splits.length;
            for (const split of dto.splits) {
                const child = await (this.prisma as any).order.create({
                    data: {
                        tenantId: order.tenantId,
                        branchId: order.branchId,
                        tableId: order.tableId,
                        totalAmount: splitAmount,
                        status: 'PENDING',
                        isSplit: true,
                        parentOrderId: order.id,
                        orderType: order.orderType,
                        source: 'QR_CODE',
                    }
                });
                results.push(child);
            }
        } else if (dto.splitType === 'BY_ITEM') {
            for (const split of dto.splits) {
                if (!split.itemIds) continue;
                const items = order.items.filter((i: any) => split.itemIds!.includes(i.id));
                const splitTotal = items.reduce((sum: number, i: any) => sum + Number(i.price) * i.quantity, 0);

                const child = await (this.prisma as any).order.create({
                    data: {
                        tenantId: order.tenantId,
                        branchId: order.branchId,
                        tableId: order.tableId,
                        totalAmount: splitTotal,
                        status: 'PENDING',
                        isSplit: true,
                        parentOrderId: order.id,
                        orderType: order.orderType,
                        source: 'QR_CODE',
                        items: {
                            create: items.map((i: any) => ({
                                productId: i.productId,
                                quantity: i.quantity,
                                price: i.price,
                            }))
                        }
                    }
                });
                results.push(child);
            }
        }
        return results;
    }
}
