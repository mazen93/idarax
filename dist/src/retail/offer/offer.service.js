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
exports.OfferService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
const promotion_dto_1 = require("./dto/promotion.dto");
let OfferService = class OfferService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    get tenantId() {
        const id = this.tenantService.getTenantId();
        if (!id)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return id;
    }
    async createPromotion(dto) {
        const tenantId = this.tenantId;
        return this.prisma.promotion.create({
            data: {
                ...dto,
                tenantId
            }
        });
    }
    async findAllPromotions() {
        const tenantId = this.tenantId;
        return this.prisma.promotion.findMany({
            where: { tenantId },
            include: { promoCodes: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updatePromotion(id, dto) {
        return this.prisma.promotion.update({
            where: { id, tenantId: this.tenantId },
            data: dto
        });
    }
    async deletePromotion(id) {
        const tenantId = this.tenantId;
        return this.prisma.$transaction([
            this.prisma.promoCode.deleteMany({
                where: { promotionId: id, tenantId }
            }),
            this.prisma.promotion.delete({
                where: { id, tenantId }
            })
        ]);
    }
    async createPromoCode(dto) {
        const tenantId = this.tenantId;
        const existing = await this.prisma.promoCode.findUnique({
            where: { code: dto.code }
        });
        if (existing) {
            throw new common_1.BadRequestException(`Promo code ${dto.code} already exists.`);
        }
        return this.prisma.promoCode.create({
            data: {
                ...dto,
                tenantId
            }
        });
    }
    async updatePromoCode(id, dto) {
        return this.prisma.promoCode.update({
            where: { id, tenantId: this.tenantId },
            data: dto
        });
    }
    async deletePromoCode(id) {
        return this.prisma.promoCode.delete({
            where: { id, tenantId: this.tenantId }
        });
    }
    async findAllLegacies() {
        return this.prisma.discount.findMany({ where: { tenantId: this.tenantId } });
    }
    async validatePromotion(code, items, customerId) {
        const tenantId = this.tenantId;
        const promoCode = await this.prisma.promoCode.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
                tenantId
            },
            include: { promotion: true }
        });
        if (!promoCode || !promoCode.promotion.isActive) {
            return this.validateLegacyOffer(code, items);
        }
        const promotion = promoCode.promotion;
        const now = new Date();
        if (promotion.validFrom && promotion.validFrom > now)
            return { isValid: false, discountAmount: 0, message: 'Promotion not yet active.' };
        if (promotion.validUntil && promotion.validUntil < now)
            return { isValid: false, discountAmount: 0, message: 'Promotion expired.' };
        if (promoCode.maxUsages && promoCode.usedCount >= promoCode.maxUsages) {
            return { isValid: false, discountAmount: 0, message: 'Promo code usage limit reached.' };
        }
        if (customerId && promoCode.maxUsagesPerCustomer) {
            const customerUsageCount = await this.prisma.promoCodeRedemption.count({
                where: { promoCodeId: promoCode.id, customerId }
            });
            if (customerUsageCount >= promoCode.maxUsagesPerCustomer) {
                return { isValid: false, discountAmount: 0, message: `You've already used this promo code the maximum allowed times.` };
            }
        }
        if (promoCode.firstOrderOnly && customerId) {
            const priorOrders = await this.prisma.order.count({
                where: { customerId, tenantId, status: { not: 'CANCELLED' } }
            });
            if (priorOrders > 0) {
                return { isValid: false, discountAmount: 0, message: 'This code is for first-time customers only.' };
            }
        }
        if (promoCode.staffOnly) {
            if (!customerId) {
                return { isValid: false, discountAmount: 0, message: 'Please select a customer to verify staff status.' };
            }
            const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
            if (!customer || !customer.email) {
                return { isValid: false, discountAmount: 0, message: 'This code is reserved for staff only. Selected customer lacks email verification.' };
            }
            const staffUser = await this.prisma.user.findFirst({
                where: { email: customer.email, tenantId }
            });
            if (!staffUser) {
                return { isValid: false, discountAmount: 0, message: 'This code is reserved for staff members only.' };
            }
        }
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (promotion.minOrderAmount && orderTotal < Number(promotion.minOrderAmount)) {
            return { isValid: false, discountAmount: 0, message: `Minimum order of ${promotion.minOrderAmount} required.` };
        }
        if (promotion.happyHourDays && promotion.happyHourDays.length > 0) {
            const dayOfWeek = now.getDay();
            const currentTime = now.toTimeString().slice(0, 5);
            const inDays = promotion.happyHourDays.includes(dayOfWeek);
            const inTime = (!promotion.happyHourStart || currentTime >= promotion.happyHourStart) &&
                (!promotion.happyHourEnd || currentTime <= promotion.happyHourEnd);
            if (!inDays || !inTime) {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayNames = promotion.happyHourDays.map((d) => days[d]).join(', ');
                return { isValid: false, discountAmount: 0, message: `This offer is only valid on ${dayNames} from ${promotion.happyHourStart || '00:00'} to ${promotion.happyHourEnd || '23:59'}.` };
            }
        }
        const applicableItems = promotion.applicableProductIds.length > 0
            ? items.filter(i => promotion.applicableProductIds.includes(i.productId))
            : items;
        if (applicableItems.length === 0) {
            return { isValid: false, discountAmount: 0, message: 'Promotion does not apply to items in cart.' };
        }
        let discountAmount = 0;
        let freeItemProductId;
        switch (promotion.type) {
            case promotion_dto_1.PromotionType.PERCENTAGE_OFF:
                discountAmount = orderTotal * (Number(promotion.discountValue) / 100);
                break;
            case promotion_dto_1.PromotionType.FIXED_AMOUNT_OFF:
                discountAmount = Number(promotion.discountValue);
                break;
            case promotion_dto_1.PromotionType.BOGO:
                applicableItems.forEach(item => {
                    const freeQty = Math.floor(item.quantity / 2);
                    discountAmount += freeQty * Number(item.price);
                });
                break;
            case promotion_dto_1.PromotionType.BUY_X_GET_Y_FREE: {
                const buyX = promotion.buyQuantity || 1;
                const getY = promotion.getQuantity || 1;
                applicableItems.forEach(item => {
                    const sets = Math.floor(item.quantity / (buyX + getY));
                    discountAmount += (sets * getY) * Number(item.price);
                });
                break;
            }
            case promotion_dto_1.PromotionType.BUY_X_GET_Y_PERCENT_OFF: {
                const bX = promotion.buyQuantity || 1;
                const gY = promotion.getQuantity || 1;
                const perc = Number(promotion.discountValue) / 100;
                applicableItems.forEach(item => {
                    const sets = Math.floor(item.quantity / (bX + gY));
                    discountAmount += (sets * gY) * Number(item.price) * perc;
                });
                break;
            }
            case promotion_dto_1.PromotionType.FREE_ITEM:
                freeItemProductId = promotion.freeItemProductId || undefined;
                discountAmount = 0;
                break;
            case promotion_dto_1.PromotionType.TIER_DISCOUNT: {
                const totalQty = applicableItems.reduce((s, i) => s + i.quantity, 0);
                const thresholds = promotion.tierThresholds || [];
                const matched = thresholds.filter(t => totalQty >= t.minQty).sort((a, b) => b.pct - a.pct)[0];
                if (matched) {
                    discountAmount = orderTotal * (matched.pct / 100);
                }
                break;
            }
            case promotion_dto_1.PromotionType.STAFF_VOUCHER:
                discountAmount = orderTotal * (Number(promotion.discountValue || 0) / 100);
                break;
        }
        if (promotion.maxDiscountAmount && discountAmount > Number(promotion.maxDiscountAmount)) {
            discountAmount = Number(promotion.maxDiscountAmount);
        }
        const finalDiscount = Math.min(discountAmount, orderTotal);
        if (finalDiscount <= 0 && promotion.type !== promotion_dto_1.PromotionType.FREE_ITEM) {
            return { isValid: false, discountAmount: 0, message: 'Code is technically valid, but does not apply any discount to these items.' };
        }
        return { isValid: true, discountAmount: finalDiscount, freeItemProductId };
    }
    async logRedemption(promoCodeIdOrCode, customerId, orderId, discountApplied, offerCode) {
        const tenantId = this.tenantId;
        let resolvedId = promoCodeIdOrCode;
        if (!resolvedId && offerCode) {
            const found = await this.prisma.promoCode.findFirst({
                where: { code: { equals: offerCode, mode: 'insensitive' }, tenantId }
            });
            resolvedId = found?.id;
        }
        if (!resolvedId)
            return { success: false, message: 'PromoCode not found for logging.' };
        await this.prisma.promoCode.update({
            where: { id: resolvedId },
            data: { usedCount: { increment: 1 } }
        });
        return this.prisma.promoCodeRedemption.create({
            data: {
                promoCodeId: resolvedId,
                customerId,
                orderId,
                discountApplied,
                tenantId
            }
        });
    }
    async getAutoPromotions(items, customerId) {
        const tenantId = this.tenantId;
        const now = new Date();
        const orderTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const promotions = await this.prisma.promotion.findMany({
            where: {
                tenantId,
                isActive: true,
                validFrom: { lte: now },
                validUntil: { gte: now },
                promoCodes: { none: {} }
            },
            include: { promoCodes: true }
        });
        const applicable = [];
        for (const promo of promotions) {
            if (promo.minOrderAmount && orderTotal < Number(promo.minOrderAmount))
                continue;
            const appItems = promo.applicableProductIds.length > 0
                ? items.filter(i => promo.applicableProductIds.includes(i.productId))
                : items;
            if (appItems.length === 0)
                continue;
            if (promo.happyHourDays && promo.happyHourDays.length > 0) {
                const day = now.getDay();
                const time = now.toTimeString().slice(0, 5);
                if (!promo.happyHourDays.includes(day))
                    continue;
                if (promo.happyHourStart && time < promo.happyHourStart)
                    continue;
                if (promo.happyHourEnd && time > promo.happyHourEnd)
                    continue;
            }
            applicable.push({
                id: promo.id,
                name: promo.name,
                type: promo.type,
                discountValue: promo.discountValue,
                description: promo.description || `Auto-applied: ${promo.name}`
            });
        }
        return applicable;
    }
    async validateLegacyOffer(code, items) {
        const tenantId = this.tenantId;
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const productIds = items.map(i => i.productId);
        const offer = await this.prisma.discount.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
                tenantId,
                isActive: true
            }
        });
        if (!offer)
            return { isValid: false, discountAmount: 0, message: 'Invalid promo code.' };
        let discountAmount = 0;
        if (offer.type === 'PERCENTAGE') {
            discountAmount = orderTotal * (Number(offer.value) / 100);
        }
        else {
            discountAmount = Number(offer.value);
        }
        const finalDiscount = Math.min(discountAmount, orderTotal);
        if (finalDiscount <= 0) {
            return { isValid: false, discountAmount: 0, message: 'Code is technically valid, but does not apply any discount to these items.' };
        }
        return { isValid: true, discountAmount: finalDiscount };
    }
    async getPromoAnalytics() {
        const tenantId = this.tenantId;
        const promoCodes = await this.prisma.promoCode.findMany({
            where: { tenantId },
            include: { promotion: true }
        });
        const orderStats = await this.prisma.order.groupBy({
            by: ['offerCode'],
            where: {
                tenantId,
                status: { in: ['COMPLETED', 'DELIVERED', 'READY', 'PREPARING', 'PENDING'] },
                offerCode: { not: null }
            },
            _count: { id: true },
            _sum: { totalAmount: true }
        });
        const statsMap = orderStats.reduce((acc, stat) => {
            if (stat.offerCode) {
                const code = stat.offerCode.toUpperCase();
                if (!acc[code]) {
                    acc[code] = { usages: 0, revenue: 0 };
                }
                acc[code].usages += stat._count.id;
                acc[code].revenue += Number(stat._sum.totalAmount || 0);
            }
            return acc;
        }, {});
        return promoCodes.map(pc => {
            const stats = statsMap[pc.code.toUpperCase()] || { usages: 0, revenue: 0 };
            return {
                id: pc.id,
                code: pc.code,
                promotionName: pc.promotion.name,
                promotionType: pc.promotion.type,
                maxUsages: pc.maxUsages,
                usedCount: stats.usages,
                totalRevenueGenerated: stats.revenue,
                status: pc.promotion.isActive ? 'Active' : 'Inactive'
            };
        });
    }
    async seedPromotions() {
        try {
            const tenantId = 'dummy-tenant-123';
            const seededCodes = [
                'SUMMER10', 'WELCOME5', 'BOGO', 'STAFF50', 'TIER_DEAL', 'FIRST_ORDER', 'FREE_TEST',
                'SUMMER10_POS', 'WELCOME5_POS', 'BOGO_POS', 'BOGO2_POS'
            ];
            await this.prisma.promoCode.deleteMany({ where: { code: { in: seededCodes } } });
            const seededNames = [
                'Summer 10% Off', 'Welcome $5 Off', 'Buy 1 Get 1',
                'Staff Meal Discount', 'Volume Tier Discount', 'New Customer Bonus',
                'Happy Hour Vibes', 'Automatic Friday Deal', 'Free Drink with Order',
                'Summer Sale 10% Off', 'Welcome Bonus $5 Off', 'Buy 1 Get 1 Free', 'Buy 2 Get 1 Free'
            ];
            await this.prisma.promotion.deleteMany({ where: { name: { in: seededNames } } });
            const sampleProduct = await this.prisma.product.findFirst({ where: { tenantId } });
            const p1 = await this.prisma.promotion.create({
                data: {
                    tenantId, name: 'Summer 10% Off', type: 'PERCENTAGE_OFF', discountValue: 10, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'SUMMER10', maxUsages: 100 } }
                }
            });
            const p2 = await this.prisma.promotion.create({
                data: {
                    tenantId, name: 'Welcome $5 Off', type: 'FIXED_AMOUNT_OFF', discountValue: 5, minOrderAmount: 20, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'WELCOME5', maxUsages: 50, maxUsagesPerCustomer: 1 } }
                }
            });
            const p3 = await this.prisma.promotion.create({
                data: {
                    tenantId, name: 'Buy 1 Get 1', type: 'BOGO', isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'BOGO', maxUsages: 100 } }
                }
            });
            const p4 = await this.prisma.promotion.create({
                data: {
                    tenantId, name: 'Staff Meal Discount', type: 'STAFF_VOUCHER', discountValue: 50, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'STAFF50', staffOnly: true } }
                }
            });
            const p5 = await this.prisma.promotion.create({
                data: {
                    tenantId, name: 'Volume Tier Discount', type: 'TIER_DISCOUNT', isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    tierThresholds: [
                        { minQty: 5, pct: 10 },
                        { minQty: 10, pct: 20 }
                    ],
                    promoCodes: { create: { tenantId, code: 'TIER_DEAL' } }
                }
            });
            const p6 = await this.prisma.promotion.create({
                data: {
                    tenantId, name: 'New Customer Bonus', type: 'PERCENTAGE_OFF', discountValue: 25, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'FIRST_ORDER', firstOrderOnly: true } }
                }
            });
            const p7 = await this.prisma.promotion.create({
                data: {
                    tenantId, name: 'Happy Hour Vibes', type: 'PERCENTAGE_OFF', discountValue: 15, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    happyHourDays: [1, 2, 3, 4, 5],
                    happyHourStart: '14:00',
                    happyHourEnd: '18:00'
                }
            });
            if (sampleProduct) {
                await this.prisma.promotion.create({
                    data: {
                        tenantId, name: 'Free Drink with Order', type: 'FREE_ITEM',
                        freeItemProductId: sampleProduct.id, minOrderAmount: 25, isActive: true,
                        validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z')
                    }
                });
            }
            return { success: true, message: 'Seeded Phase 1-3 test promotions successfully.' };
        }
        catch (error) {
            console.error('Seed Error:', error);
            return { success: false, error: error.message, stack: error.stack };
        }
    }
};
exports.OfferService = OfferService;
exports.OfferService = OfferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], OfferService);
//# sourceMappingURL=offer.service.js.map