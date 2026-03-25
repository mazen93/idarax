"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const QRCode = __importStar(require("qrcode"));
let PublicService = class PublicService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTenantBranding(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                settings: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        return {
            id: tenant.id,
            name: tenant.name,
            type: tenant.type,
            logoUrl: tenant.settings?.logoUrl,
            currency: tenant.settings?.currency || 'USD',
            taxRate: tenant.settings?.taxRate,
            serviceFee: tenant.settings?.serviceFee,
            aboutUsText: tenant.settings?.aboutUsText,
            bannerImageUrl: tenant.settings?.bannerImageUrl,
            facebookUrl: tenant.settings?.facebookUrl,
            instagramUrl: tenant.settings?.instagramUrl,
            twitterUrl: tenant.settings?.twitterUrl,
            contactEmail: tenant.settings?.contactEmail,
            contactPhone: tenant.settings?.contactPhone,
        };
    }
    async getBranches(tenantId) {
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
    async getMenu(tenantId, branchId) {
        const categories = await this.prisma.category.findMany({
            where: { tenantId },
            include: {
                products: {
                    where: {
                        isSellable: true,
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
    async createGuestOrder(tenantId, dto) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { settings: true }
        });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        let customerId = null;
        if (dto.customerPhone) {
            let customer = await this.prisma.customer.findFirst({
                where: {
                    phone: dto.customerPhone,
                    tenantId: tenantId
                }
            });
            if (!customer) {
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
                }
                else {
                    if (existingPhone.tenantId === tenantId) {
                        customerId = existingPhone.id;
                    }
                }
            }
            else {
                customerId = customer.id;
            }
        }
        const taxRate = Number(tenant.settings?.taxRate || 0);
        const serviceFeeRate = Number(tenant.settings?.serviceFee || 0);
        const subtotal = Number(dto.totalAmount);
        const serviceFeeAmount = (dto.orderType === 'DINE_IN') ? (subtotal * (serviceFeeRate / 100)) : 0;
        const taxAmount = (subtotal + serviceFeeAmount) * (taxRate / 100);
        const finalTotal = subtotal + taxAmount + serviceFeeAmount;
        const order = await this.prisma.order.create({
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
                orderType: (dto.orderType === 'PICKUP' ? 'TAKEAWAY' : (dto.orderType || 'IN_STORE')),
                source: (dto.source === 'WEB_STORE' ? 'MOBILE_APP' : (dto.source || 'QR_CODE')),
                note: dto.note,
                status: 'PENDING',
                items: {
                    create: dto.items.map((item) => ({
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
        if (dto.tableId) {
            await this.prisma.table.update({
                where: { id: dto.tableId },
                data: { status: 'OCCUPIED' }
            }).catch((err) => console.error('Failed to update table status:', err));
        }
        return order;
    }
    async generateTableQr(tenantId, tableId) {
        const table = await this.prisma.table.findUnique({
            where: { id: tableId },
        });
        if (!table || table.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Table not found');
        }
        const baseUrl = process.env.FRONTEND_PUBLIC_URL || 'https://idarax.com';
        const deepLink = `${baseUrl}/m/${tenantId}?table=${tableId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(deepLink);
        return {
            tableNumber: table.number,
            deepLink,
            qrCodeDataUrl,
        };
    }
    async createOrderFeedback(orderId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return this.prisma.orderFeedback.create({
            data: {
                orderId,
                tenantId: order.tenantId,
                rating: dto.rating,
                comment: dto.comment,
            },
        });
    }
    async getTableOrder(tableId) {
        const order = await this.prisma.order.findFirst({
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
        if (!order)
            return null;
        return order;
    }
    async getTable(id) {
        const table = await this.prisma.table.findUnique({
            where: { id },
            include: {
                section: {
                    select: { branchId: true }
                }
            }
        });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        return {
            id: table.id,
            number: table.number,
            branchId: table.section?.branchId || table.branchId || null
        };
    }
    async splitOrder(orderId, dto) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const results = [];
        if (dto.splitType === 'EQUAL') {
            const splitAmount = Number(order.totalAmount) / dto.splits.length;
            for (const split of dto.splits) {
                const child = await this.prisma.order.create({
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
        }
        else if (dto.splitType === 'BY_ITEM') {
            for (const split of dto.splits) {
                if (!split.itemIds)
                    continue;
                const items = order.items.filter((i) => split.itemIds.includes(i.id));
                const splitTotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
                const child = await this.prisma.order.create({
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
                            create: items.map((i) => ({
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
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map