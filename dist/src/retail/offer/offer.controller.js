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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedOfferController = exports.OfferController = void 0;
const common_1 = require("@nestjs/common");
const offer_service_1 = require("./offer.service");
const promotion_dto_1 = require("./dto/promotion.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const permissions_decorator_1 = require("../../auth/permissions.decorator");
const permissions_constants_1 = require("../../auth/permissions.constants");
let OfferController = class OfferController {
    offerService;
    constructor(offerService) {
        this.offerService = offerService;
    }
    createPromotion(dto) {
        return this.offerService.createPromotion(dto);
    }
    findAllPromotions() {
        return this.offerService.findAllPromotions();
    }
    updatePromotion(id, dto) {
        return this.offerService.updatePromotion(id, dto);
    }
    deletePromotion(id) {
        return this.offerService.deletePromotion(id);
    }
    createPromoCode(dto) {
        return this.offerService.createPromoCode(dto);
    }
    updatePromoCode(id, dto) {
        return this.offerService.updatePromoCode(id, dto);
    }
    deletePromoCode(id) {
        return this.offerService.deletePromoCode(id);
    }
    validatePromotion(dto) {
        return this.offerService.validatePromotion(dto.code, dto.items || [], dto.customerId);
    }
    logRedemption(dto) {
        return this.offerService.logRedemption(dto.promoCodeId, dto.customerId, dto.orderId, dto.discountApplied, dto.offerCode);
    }
    getAutoPromotions(dto) {
        return this.offerService.getAutoPromotions(dto.items || [], dto.customerId);
    }
    getPromoAnalytics() {
        return this.offerService.getPromoAnalytics();
    }
};
exports.OfferController = OfferController;
__decorate([
    (0, common_1.Post)('promotions'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promotion_dto_1.CreatePromotionDto]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "createPromotion", null);
__decorate([
    (0, common_1.Get)('promotions'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.VIEW),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "findAllPromotions", null);
__decorate([
    (0, common_1.Patch)('promotions/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "updatePromotion", null);
__decorate([
    (0, common_1.Delete)('promotions/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "deletePromotion", null);
__decorate([
    (0, common_1.Post)('promo-codes'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promotion_dto_1.CreatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "createPromoCode", null);
__decorate([
    (0, common_1.Patch)('promo-codes/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.EDIT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "updatePromoCode", null);
__decorate([
    (0, common_1.Delete)('promo-codes/:id'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.DELETE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "deletePromoCode", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.VIEW),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "validatePromotion", null);
__decorate([
    (0, common_1.Post)('log-redemption'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.ORDERS.CREATE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [promotion_dto_1.LogRedemptionDto]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "logRedemption", null);
__decorate([
    (0, common_1.Post)('auto-promotions'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.OFFERS.VIEW),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "getAutoPromotions", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.REPORTS.VIEW_ALL),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "getPromoAnalytics", null);
exports.OfferController = OfferController = __decorate([
    (0, common_1.Controller)('offers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [offer_service_1.OfferService])
], OfferController);
let SeedOfferController = class SeedOfferController {
    offerService;
    constructor(offerService) {
        this.offerService = offerService;
    }
    async seedPromotions() {
        return this.offerService.seedPromotions();
    }
};
exports.SeedOfferController = SeedOfferController;
__decorate([
    (0, common_1.Get)('promotions'),
    (0, permissions_decorator_1.Permissions)(permissions_constants_1.Actions.SETTINGS.EDIT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeedOfferController.prototype, "seedPromotions", null);
exports.SeedOfferController = SeedOfferController = __decorate([
    (0, common_1.Controller)('seed-offers'),
    __metadata("design:paramtypes", [offer_service_1.OfferService])
], SeedOfferController);
//# sourceMappingURL=offer.controller.js.map