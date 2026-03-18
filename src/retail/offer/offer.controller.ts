import { Controller, Get, Post, Body, UseGuards, Req, Patch, Delete, Param } from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreatePromotionDto, CreatePromoCodeDto, LogRedemptionDto } from './dto/promotion.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OfferController {
    constructor(private readonly offerService: OfferService) { }

    @Post('promotions')
    @Permissions(Actions.OFFERS.CREATE)
    createPromotion(@Body() dto: CreatePromotionDto) {
        return this.offerService.createPromotion(dto);
    }

    @Get('promotions')
    @Permissions(Actions.OFFERS.VIEW)
    findAllPromotions() {
        return this.offerService.findAllPromotions();
    }

    @Patch('promotions/:id')
    @Permissions(Actions.OFFERS.EDIT)
    updatePromotion(@Param('id') id: string, @Body() dto: Partial<CreatePromotionDto>) {
        return this.offerService.updatePromotion(id, dto);
    }

    @Delete('promotions/:id')
    @Permissions(Actions.OFFERS.DELETE)
    deletePromotion(@Param('id') id: string) {
        return this.offerService.deletePromotion(id);
    }

    @Post('promo-codes')
    @Permissions(Actions.OFFERS.CREATE)
    createPromoCode(@Body() dto: CreatePromoCodeDto) {
        return this.offerService.createPromoCode(dto);
    }

    @Patch('promo-codes/:id')
    @Permissions(Actions.OFFERS.EDIT)
    updatePromoCode(@Param('id') id: string, @Body() dto: Partial<CreatePromoCodeDto>) {
        return this.offerService.updatePromoCode(id, dto);
    }

    @Delete('promo-codes/:id')
    @Permissions(Actions.OFFERS.DELETE)
    deletePromoCode(@Param('id') id: string) {
        return this.offerService.deletePromoCode(id);
    }

    @Post('validate')
    @Permissions(Actions.OFFERS.VIEW) // Allow POS cashiers viewing / validating
    validatePromotion(@Body() dto: { code: string, items: { productId: string, quantity: number, price: number }[], customerId?: string }) {
        return this.offerService.validatePromotion(dto.code, dto.items || [], dto.customerId);
    }

    // Phase 1: Log a promo redemption after order is finalized
    @Post('log-redemption')
    @Permissions(Actions.ORDERS.CREATE) // Only an active order creation process should log
    logRedemption(@Body() dto: LogRedemptionDto) {
        return this.offerService.logRedemption(dto.promoCodeId, dto.customerId, dto.orderId, dto.discountApplied, dto.offerCode);
    }

    // Phase 2: Get auto-applicable promotions (no code needed)
    @Post('auto-promotions')
    @Permissions(Actions.OFFERS.VIEW)
    getAutoPromotions(@Body() dto: { items: { productId: string, quantity: number, price: number }[], customerId?: string }) {
        return this.offerService.getAutoPromotions(dto.items || [], dto.customerId);
    }

    @Get('analytics')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    getPromoAnalytics() {
        return this.offerService.getPromoAnalytics();
    }
}

@Controller('seed-offers')
export class SeedOfferController {
    constructor(private readonly offerService: OfferService) { }

    @Get('promotions')
    @Permissions(Actions.SETTINGS.EDIT) // Seed route restricted to a high-level action
    async seedPromotions() {
        return this.offerService.seedPromotions();
    }
}
