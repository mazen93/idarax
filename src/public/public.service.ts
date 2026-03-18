import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/public.dto';
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
        // Basic order creation logic for guests
        return (this.prisma as any).order.create({
            data: {
                tenantId,
                totalAmount: dto.totalAmount,
                guestName: dto.customerName,
                guestPhone: dto.customerPhone,
                tableId: dto.tableId || undefined,
                branchId: dto.branchId || undefined, // Support branch linking
                orderType: dto.orderType || 'IN_STORE', // Default to in-store if table provided
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
}
