import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { SplitBillDto } from '../order/dto/order.dto';
import { NumberingService } from '../order/numbering.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PublicService {
    constructor(
        private prisma: PrismaService,
        private numberingService: NumberingService
    ) { }

    async getTenantBranding(tenantIdOrDomain: string) {
        // Try finding by ID (UUID format) or by domain
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdOrDomain);
        
        const tenant = await (this.prisma.tenant as any).findFirst({
            where: {
                OR: [
                    { id: isUuid ? tenantIdOrDomain : undefined },
                    { domain: tenantIdOrDomain },
                    { slug: tenantIdOrDomain },
                    { customDomain: tenantIdOrDomain }
                ]
            },
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

    async getBranches(tenantIdOrDomain: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdOrDomain);

        const tenant = await (this.prisma.tenant as any).findFirst({
            where: {
                OR: [
                    { id: isUuid ? tenantIdOrDomain : undefined },
                    { domain: tenantIdOrDomain },
                    { slug: tenantIdOrDomain },
                    { customDomain: tenantIdOrDomain }
                ]
            },
            select: { id: true }
        });

        if (!tenant) return [];

        const branches = await (this.prisma.client as any).branch.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                nameAr: true,
                address: true,
                phone: true,
                settings: {
                    select: {
                        preOrderEnabled: true,
                        preOrderMaxDaysAhead: true,
                        preOrderLeadMinutes: true,
                    }
                }
            },
            orderBy: { name: 'asc' },
        });

        return (branches as any[]).map((b: any) => ({
            id: b.id,
            name: b.name,
            nameAr: b.nameAr,
            address: b.address,
            phone: b.phone,
            preOrderEnabled: b.settings?.preOrderEnabled ?? false,
            preOrderMaxDaysAhead: b.settings?.preOrderMaxDaysAhead ?? 7,
            preOrderLeadMinutes: b.settings?.preOrderLeadMinutes ?? 30,
        }));
    }

    async getMenu(tenantIdOrDomain: string, branchId?: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdOrDomain);

        const tenant = await (this.prisma.tenant as any).findFirst({
            where: {
                OR: [
                    { id: isUuid ? tenantIdOrDomain : undefined },
                    { domain: tenantIdOrDomain },
                    { slug: tenantIdOrDomain },
                    { customDomain: tenantIdOrDomain }
                ]
            },
            select: { id: true }
        });

        if (!tenant) return [];

        const categories = await this.prisma.category.findMany({
            where: { tenantId: tenant.id },
            include: {
                products: {
                    where: {
                        isSellable: true,
                        // If a branch is specified, show products that are explicitly available OR have no branch override
                        ...(branchId ? {
                            OR: [
                                {
                                    branchSettings: {
                                        some: {
                                            branchId,
                                            isAvailable: true,
                                        }
                                    }
                                },
                                {
                                    branchSettings: {
                                        none: {
                                            branchId,
                                        }
                                    }
                                }
                            ]
                        } : {})
                    },
                    include: {
                        variants: true,
                        modifiers: {
                            include: {
                                options: true,
                            }
                        },
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
                    modifiers: p.modifiers,
                };
            }),
        })).filter(cat => cat.products.length > 0);
    }

    async createGuestOrder(tenantIdOrDomain: string, dto: CreatePublicOrderDto) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdOrDomain);

        const tenant = await (this.prisma.tenant as any).findFirst({
            where: {
                OR: [
                    { id: isUuid ? tenantIdOrDomain : undefined },
                    { domain: tenantIdOrDomain },
                    { slug: tenantIdOrDomain },
                    { customDomain: tenantIdOrDomain }
                ]
            },
            include: { settings: true }
        });

        if (!tenant) throw new NotFoundException('Tenant not found');
        const tenantId = tenant.id;

        return this.prisma.$transaction(async (tx) => {
            // 1. Customer Integration: Look up or create customer by phone
            let customerId = null;
            if (dto.customerPhone) {
                let customer = await tx.customer.findFirst({
                    where: { 
                        phone: dto.customerPhone,
                        tenantId: tenantId
                    }
                });

                if (!customer) {
                    const existingPhone = await tx.customer.findUnique({
                        where: { phone: dto.customerPhone }
                    });

                    if (!existingPhone) {
                        customer = await tx.customer.create({
                            data: {
                                name: dto.customerName,
                                phone: dto.customerPhone,
                                tenantId: tenantId,
                            }
                        });
                        customerId = customer.id;
                    } else if (existingPhone.tenantId === tenantId) {
                        customerId = existingPhone.id;
                    }
                } else {
                    customerId = customer.id;
                }
            }

            // 2. Financial Calculations
            const taxRate = Number(tenant.settings?.taxRate || 0);
            const serviceFeeRate = Number(tenant.settings?.serviceFee || 0);
            
            const subtotal = Number(dto.totalAmount);
            const serviceFeeAmount = (dto.orderType === 'DINE_IN' || dto.deliveryType === 'DINE_IN') ? (subtotal * (serviceFeeRate / 100)) : 0;
            const taxAmount = (subtotal + serviceFeeAmount) * (taxRate / 100);
            const finalTotal = subtotal + taxAmount + serviceFeeAmount;

            // 3. Numbering Generation
            const timezone = tenant.settings?.timezone || 'UTC';
            const branchId = dto.branchId || null;
            let businessDayStartHour = 0;
            if (branchId) {
                const branch = await tx.branch.findUnique({
                    where: { id: branchId },
                    select: { businessDayStartHour: true }
                });
                businessDayStartHour = branch?.businessDayStartHour || 0;
            }

            const receiptNumber = await this.numberingService.nextReceiptNumber(
                tx, tenantId, branchId, timezone, businessDayStartHour
            );
            const invoiceNumber = await this.numberingService.nextInvoiceNumber(
                tx, tenantId, timezone, branchId, businessDayStartHour
            );

            // 4. Create Order
            const finalTableId = dto.tableId || dto.tableNumber || undefined;
            const finalOrderType = dto.orderType || dto.deliveryType || 'IN_STORE';

            const order = await (tx as any).order.create({
                data: {
                    tenantId,
                    customerId,
                    totalAmount: finalTotal,
                    taxAmount,
                    serviceFeeAmount,
                    guestName: dto.customerName,
                    guestPhone: dto.customerPhone,
                    tableId: finalTableId,
                    branchId: branchId || undefined, 
                    orderType: (finalOrderType === 'PICKUP' ? 'TAKEAWAY' : finalOrderType) as any,
                    source: (dto.source || 'WEB_STORE') as any, 
                    note: dto.note,
                    // Pre-order: if scheduledAt provided, hold as SCHEDULED
                    status: dto.isPreOrder && dto.scheduledAt ? 'SCHEDULED' : 'PENDING',
                    isPreOrder: dto.isPreOrder || false,
                    scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
                    receiptNumber,
                    invoiceNumber,
                    items: {
                        create: dto.items.map((item: any) => ({
                            productId: item.productId,
                            variantId: item.variantId || undefined,
                            quantity: item.quantity,
                            price: item.price,
                            modifiers: item.modifiers ? {
                                create: item.modifiers.map((m: any) => ({
                                    optionId: m.optionId,
                                    price: 0,
                                }))
                            } : undefined
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            modifiers: true,
                        }
                    },
                },
            });

            // 5. Update Table Status if applicable
            if (dto.tableId) {
                await (tx as any).table.update({
                    where: { id: dto.tableId },
                    data: { status: 'OCCUPIED' }
                }).catch((err: any) => console.error('Failed to update table status:', err));
            }

            return order;
        });
    }

    async generateTableQr(tenantIdOrDomain: string, tableId: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantIdOrDomain);

        const tenant = await (this.prisma.tenant as any).findFirst({
            where: {
                OR: [
                    { id: isUuid ? tenantIdOrDomain : undefined },
                    { domain: tenantIdOrDomain },
                    { slug: tenantIdOrDomain },
                    { customDomain: tenantIdOrDomain }
                ]
            },
            select: { id: true, domain: true, slug: true, customDomain: true }
        });

        const table = await (this.prisma as any).table.findUnique({
            where: { id: tableId },
        });

        if (!table || !tenant || table.tenantId !== tenant.id) {
            throw new NotFoundException('Table not found');
        }

        // Deep link URL: Use customDomain > slug > domain > id
        const baseUrl = process.env.FRONTEND_PUBLIC_URL || 'https://idarax.com';
        const identifier = tenant.customDomain || tenant.slug || tenant.domain || tenant.id;
        
        // If it's a custom domain, the link should be absolute to that domain
        const deepLink = tenant.customDomain 
            ? `https://${tenant.customDomain}?table=${tableId}`
            : `${baseUrl}/m/${identifier}?table=${tableId}`;

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

    async getPublicOrder(id: string) {
        const order = await (this.prisma as any).order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, nameAr: true, price: true } }
                    }
                },
                tenant: { select: { name: true, id: true } }
            }
        });

        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
}
