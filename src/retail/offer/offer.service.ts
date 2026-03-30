import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreatePromotionDto, CreatePromoCodeDto, PromotionType } from './dto/promotion.dto';

@Injectable()
export class OfferService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    private get tenantId() {
        const id = this.tenantService.getTenantId();
        if (!id) throw new ForbiddenException('Tenant ID missing');
        return id;
    }

    // --- Promotions CRUD ---

    async createPromotion(dto: CreatePromotionDto) {
        const tenantId = this.tenantId;
        return this.prisma.promotion.create({
            data: {
                ...dto,
                tenantId
            } as any
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

    async updatePromotion(id: string, dto: Partial<CreatePromotionDto>) {
        return this.prisma.promotion.update({
            where: { id, tenantId: this.tenantId },
            data: dto as any
        });
    }

    async deletePromotion(id: string) {
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

    // --- PromoCodes CRUD ---

    async createPromoCode(dto: CreatePromoCodeDto) {
        const tenantId = this.tenantId;

        const existing = await this.prisma.promoCode.findUnique({
            where: { code: dto.code }
        });

        if (existing) {
            throw new BadRequestException(`Promo code ${dto.code} already exists.`);
        }

        return this.prisma.promoCode.create({
            data: {
                ...dto,
                tenantId
            }
        });
    }

    async updatePromoCode(id: string, dto: Partial<CreatePromoCodeDto>) {
        return this.prisma.promoCode.update({
            where: { id, tenantId: this.tenantId },
            data: dto
        });
    }

    async deletePromoCode(id: string) {
        return this.prisma.promoCode.delete({
            where: { id, tenantId: this.tenantId }
        });
    }

    // --- Legacy Support & Bridge ---
    // Mapping existing 'Discount' logic to be unified or just keeping for simple coupons
    async findAllLegacies() {
        return this.prisma.discount.findMany({ where: { tenantId: this.tenantId } });
    }

    // --- Main Rule Engine ---

    async validatePromotion(
        code: string,
        items: { productId: string, quantity: number, price: number }[],
        customerId?: string
    ): Promise<{ isValid: boolean, discountAmount: number, message?: string, freeItemProductId?: string }> {
        const tenantId = this.tenantId;
        const promoCode = await this.prisma.promoCode.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
                tenantId
            },
            include: { promotion: true }
        });

        // --- Step 1: Code exists check ---
        if (!promoCode || !promoCode.promotion.isActive) {
            return this.validateLegacyOffer(code, items);
        }

        const promotion = promoCode.promotion as any;
        const now = new Date();

        // --- Step 2: Active date range ---
        if (promotion.validFrom && promotion.validFrom > now) return { isValid: false, discountAmount: 0, message: 'Promotion not yet active.' };
        if (promotion.validUntil && promotion.validUntil < now) return { isValid: false, discountAmount: 0, message: 'Promotion expired.' };

        // --- Step 3: Global usage limit ---
        if (promoCode.maxUsages && promoCode.usedCount >= promoCode.maxUsages) {
            return { isValid: false, discountAmount: 0, message: 'Promo code usage limit reached.' };
        }

        // --- Step 4: Per-customer usage limit ---
        if (customerId && (promoCode as any).maxUsagesPerCustomer) {
            const customerUsageCount = await (this.prisma as any).promoCodeRedemption.count({
                where: { promoCodeId: promoCode.id, customerId }
            });
            if (customerUsageCount >= (promoCode as any).maxUsagesPerCustomer) {
                return { isValid: false, discountAmount: 0, message: `You've already used this promo code the maximum allowed times.` };
            }
        }

        // --- Step 5: First order only ---
        if ((promoCode as any).firstOrderOnly && customerId) {
            const priorOrders = await this.prisma.order.count({
                where: { customerId, tenantId, status: { not: 'CANCELLED' } }
            });
            if (priorOrders > 0) {
                return { isValid: false, discountAmount: 0, message: 'This code is for first-time customers only.' };
            }
        }

        // --- Step 5.5: Staff only check ---
        if ((promoCode as any).staffOnly) {
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

        // --- Step 6: Minimum order amount ---
        const orderTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (promotion.minOrderAmount && orderTotal < Number(promotion.minOrderAmount)) {
            return { isValid: false, discountAmount: 0, message: `Minimum order of ${promotion.minOrderAmount} required.` };
        }

        // --- Step 7: Happy hour window ---
        if (promotion.happyHourDays && promotion.happyHourDays.length > 0) {
            const dayOfWeek = now.getDay(); // 0=Sun .. 6=Sat
            const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
            const inDays = promotion.happyHourDays.includes(dayOfWeek);
            const inTime = (!promotion.happyHourStart || currentTime >= promotion.happyHourStart) &&
                (!promotion.happyHourEnd || currentTime <= promotion.happyHourEnd);
            if (!inDays || !inTime) {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayNames = promotion.happyHourDays.map((d: number) => days[d]).join(', ');
                return { isValid: false, discountAmount: 0, message: `This offer is only valid on ${dayNames} from ${promotion.happyHourStart || '00:00'} to ${promotion.happyHourEnd || '23:59'}.` };
            }
        }

        // --- Step 8: Product applicability ---
        const applicableItems = promotion.applicableProductIds.length > 0
            ? items.filter(i => promotion.applicableProductIds.includes(i.productId))
            : items;

        if (applicableItems.length === 0) {
            return { isValid: false, discountAmount: 0, message: 'Promotion does not apply to items in cart.' };
        }

        // --- Discount Calculation ---
        let discountAmount = 0;
        let freeItemProductId: string | undefined;

        switch (promotion.type) {
            case PromotionType.PERCENTAGE_OFF:
                discountAmount = orderTotal * (Number(promotion.discountValue) / 100);
                break;
            case PromotionType.FIXED_AMOUNT_OFF:
                discountAmount = Number(promotion.discountValue);
                break;
            case PromotionType.BOGO:
                applicableItems.forEach(item => {
                    const freeQty = Math.floor(item.quantity / 2);
                    discountAmount += freeQty * Number(item.price);
                });
                break;
            case PromotionType.BUY_X_GET_Y_FREE: {
                const buyX = promotion.buyQuantity || 1;
                const getY = promotion.getQuantity || 1;
                applicableItems.forEach(item => {
                    const sets = Math.floor(item.quantity / (buyX + getY));
                    discountAmount += (sets * getY) * Number(item.price);
                });
                break;
            }
            case PromotionType.BUY_X_GET_Y_PERCENT_OFF: {
                const bX = promotion.buyQuantity || 1;
                const gY = promotion.getQuantity || 1;
                const perc = Number(promotion.discountValue) / 100;
                applicableItems.forEach(item => {
                    const sets = Math.floor(item.quantity / (bX + gY));
                    discountAmount += (sets * gY) * Number(item.price) * perc;
                });
                break;
            }
            case PromotionType.FREE_ITEM:
                // Returns the free product ID; POS must add it to cart at $0
                freeItemProductId = promotion.freeItemProductId || undefined;
                discountAmount = 0; // Discount handled by adding the item
                break;
            case PromotionType.TIER_DISCOUNT: {
                // tierThresholds: [{minQty: 5, pct: 10}, {minQty: 10, pct: 15}] - highest matching tier wins
                const totalQty = applicableItems.reduce((s, i) => s + i.quantity, 0);
                const thresholds: { minQty: number; pct: number }[] = promotion.tierThresholds || [];
                const matched = thresholds.filter(t => totalQty >= t.minQty).sort((a, b) => b.pct - a.pct)[0];
                if (matched) {
                    discountAmount = orderTotal * (matched.pct / 100);
                }
                break;
            }
            case PromotionType.STAFF_VOUCHER:
                // Staff vouchers apply a flat percentage
                discountAmount = orderTotal * (Number(promotion.discountValue || 0) / 100);
                break;
        }

        if (promotion.maxDiscountAmount && discountAmount > Number(promotion.maxDiscountAmount)) {
            discountAmount = Number(promotion.maxDiscountAmount);
        }

        const finalDiscount = Math.min(discountAmount, orderTotal);

        if (finalDiscount <= 0 && promotion.type !== PromotionType.FREE_ITEM) {
            return { isValid: false, discountAmount: 0, message: 'Code is technically valid, but does not apply any discount to these items.' };
        }

        return { isValid: true, discountAmount: finalDiscount, freeItemProductId };
    }

    // Phase 1: Log a promo code redemption after order is saved
    async logRedemption(promoCodeIdOrCode: string | undefined, customerId: string, orderId: string, discountApplied: number, offerCode?: string) {
        const tenantId = this.tenantId;

        // Resolve promoCode — either by ID or by code string
        let resolvedId = promoCodeIdOrCode;
        if (!resolvedId && offerCode) {
            const found = await this.prisma.promoCode.findFirst({
                where: { code: { equals: offerCode, mode: 'insensitive' }, tenantId }
            });
            resolvedId = found?.id;
        }

        if (!resolvedId) return { success: false, message: 'PromoCode not found for logging.' };

        // Increment usedCount on the PromoCode
        await this.prisma.promoCode.update({
            where: { id: resolvedId },
            data: { usedCount: { increment: 1 } }
        });

        // Create redemption log entry
        return (this.prisma as any).promoCodeRedemption.create({
            data: {
                promoCodeId: resolvedId,
                customerId,
                orderId,
                discountApplied,
                tenantId
            }
        });
    }

    // Phase 2: Return all promotions that auto-apply without a code
    async getAutoPromotions(items: { productId: string, quantity: number, price: number }[], customerId?: string) {
        const tenantId = this.tenantId;
        const now = new Date();
        const orderTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

        // Find all active promotions that have NO promo codes (auto-apply) or have isActive=true
        const promotions = await this.prisma.promotion.findMany({
            where: {
                tenantId,
                isActive: true,
                validFrom: { lte: now },
                validUntil: { gte: now },
                // Only those with no codes (truly automatic)
                promoCodes: { none: {} }
            },
            include: { promoCodes: true }
        });

        const applicable = [];
        for (const promo of promotions as any[]) {
            // Check minimum order
            if (promo.minOrderAmount && orderTotal < Number(promo.minOrderAmount)) continue;

            // Check product applicability
            const appItems = promo.applicableProductIds.length > 0
                ? items.filter(i => promo.applicableProductIds.includes(i.productId))
                : items;
            if (appItems.length === 0) continue;

            // Check happy hour
            if (promo.happyHourDays && promo.happyHourDays.length > 0) {
                const day = now.getDay();
                const time = now.toTimeString().slice(0, 5);
                if (!promo.happyHourDays.includes(day)) continue;
                if (promo.happyHourStart && time < promo.happyHourStart) continue;
                if (promo.happyHourEnd && time > promo.happyHourEnd) continue;
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

    private async validateLegacyOffer(code: string, items: { productId: string, quantity: number, price: number }[]) {
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

        if (!offer) return { isValid: false, discountAmount: 0, message: 'Invalid promo code.' };

        // ... existing logic from old validateOffer (abbreviated for the unified engine)
        let discountAmount = 0;
        if (offer.type === 'PERCENTAGE') {
            discountAmount = orderTotal * (Number(offer.value) / 100);
        } else {
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

        // 1. Get all promo codes for the tenant
        const promoCodes = await this.prisma.promoCode.findMany({
            where: { tenantId },
            include: { promotion: true }
        });

        // 2. Aggregate order stats by promo code
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

        // Map stats by uppercase code for case-insensitive matching
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
        }, {} as Record<string, { usages: number, revenue: number }>);

        // 3. Format the final response
        return promoCodes.map(pc => {
            const stats = statsMap[pc.code.toUpperCase()] || { usages: 0, revenue: 0 };
            return {
                id: pc.id,
                code: pc.code,
                promotionName: pc.promotion.name,
                promotionType: pc.promotion.type,
                maxUsages: pc.maxUsages,
                usedCount: stats.usages, // Use actual order count for better accuracy, or pc.usedCount
                totalRevenueGenerated: stats.revenue,
                status: pc.promotion.isActive ? 'Active' : 'Inactive'
            };
        });
    }

    async seedPromotions() {
        try {
            // Hardcode the test tenant ID to ensure consistency with the POS/Admin frontend
            const tenantId = 'dummy-tenant-123';

            // Clean up existing seeded promos (GLOABLLY to avoid unique constraint failures on 'code')
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

            // Get a random product for FREE_ITEM testing
            const sampleProduct = await this.prisma.product.findFirst({ where: { tenantId } });

            // 1. Percentage Off
            const p1 = await (this.prisma as any).promotion.create({
                data: {
                    tenantId, name: 'Summer 10% Off', type: 'PERCENTAGE_OFF', discountValue: 10, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'SUMMER10', maxUsages: 100 } }
                }
            });

            // 2. Fixed Amount + Per Customer Limit
            const p2 = await (this.prisma as any).promotion.create({
                data: {
                    tenantId, name: 'Welcome $5 Off', type: 'FIXED_AMOUNT_OFF', discountValue: 5, minOrderAmount: 20, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'WELCOME5', maxUsages: 50, maxUsagesPerCustomer: 1 } }
                }
            });

            // 3. BOGO
            const p3 = await (this.prisma as any).promotion.create({
                data: {
                    tenantId, name: 'Buy 1 Get 1', type: 'BOGO', isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'BOGO', maxUsages: 100 } }
                }
            });

            // 4. Staff Voucher (Internal Only)
            const p4 = await (this.prisma as any).promotion.create({
                data: {
                    tenantId, name: 'Staff Meal Discount', type: 'STAFF_VOUCHER', discountValue: 50, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'STAFF50', staffOnly: true } }
                }
            });

            // 5. Tiered Discount (Volume Based)
            const p5 = await (this.prisma as any).promotion.create({
                data: {
                    tenantId, name: 'Volume Tier Discount', type: 'TIER_DISCOUNT', isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    tierThresholds: [
                        { minQty: 5, pct: 10 },
                        { minQty: 10, pct: 20 }
                    ] as any,
                    promoCodes: { create: { tenantId, code: 'TIER_DEAL' } }
                }
            });

            // 6. First Order Only Restriction
            const p6 = await (this.prisma as any).promotion.create({
                data: {
                    tenantId, name: 'New Customer Bonus', type: 'PERCENTAGE_OFF', discountValue: 25, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    promoCodes: { create: { tenantId, code: 'FIRST_ORDER', firstOrderOnly: true } }
                }
            });

            // 7. Happy Hour (Automatic - No Code)
            const p7 = await (this.prisma as any).promotion.create({
                data: {
                    tenantId, name: 'Happy Hour Vibes', type: 'PERCENTAGE_OFF', discountValue: 15, isActive: true,
                    validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z'),
                    happyHourDays: [1, 2, 3, 4, 5], // Weekdays
                    happyHourStart: '14:00',
                    happyHourEnd: '18:00'
                }
            });

            // 8. Free Item (Automatic - No Code)
            if (sampleProduct) {
                await (this.prisma as any).promotion.create({
                    data: {
                        tenantId, name: 'Free Drink with Order', type: 'FREE_ITEM',
                        freeItemProductId: sampleProduct.id, minOrderAmount: 25, isActive: true,
                        validFrom: new Date(), validUntil: new Date('2026-12-31T23:59:59Z')
                    }
                });
            }

            return { success: true, message: 'Seeded Phase 1-3 test promotions successfully.' };
        } catch (error) {
            console.error('Seed Error:', error);
            return { success: false, error: error.message, stack: error.stack };
        }
    }
}
