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
        return this.prisma.order.create({
            data: {
                tenantId,
                totalAmount: dto.totalAmount,
                guestName: dto.customerName,
                guestPhone: dto.customerPhone,
                tableId: dto.tableId || undefined,
                branchId: dto.branchId || undefined,
                orderType: dto.orderType || 'IN_STORE',
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
};
exports.PublicService = PublicService;
exports.PublicService = PublicService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicService);
//# sourceMappingURL=public.service.js.map