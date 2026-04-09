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
exports.ZatcaController = void 0;
const common_1 = require("@nestjs/common");
const zatca_onboarding_service_1 = require("./zatca-onboarding.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let ZatcaController = class ZatcaController {
    onboardingService;
    prisma;
    constructor(onboardingService, prisma) {
        this.onboardingService = onboardingService;
        this.prisma = prisma;
    }
    async updateSettings(req, dto) {
        const tenantId = req.user.tenantId;
        return this.prisma.settings.update({
            where: { tenantId },
            data: {
                zatcaVatNumber: dto.vatNumber,
                zatcaSellerNameAr: dto.sellerNameAr,
                zatcaSellerNameEn: dto.sellerNameEn,
                zatcaPhase: dto.phase || 1,
            },
        });
    }
    async onboard(req) {
        try {
            const tenantId = req.user.tenantId;
            return await this.onboardingService.onboardDevice(tenantId);
        }
        catch (err) {
            throw new common_1.InternalServerErrorException(err.message);
        }
    }
    async completeOnboarding(req, otp) {
        try {
            const tenantId = req.user.tenantId;
            return await this.onboardingService.completeOnboarding(tenantId, otp);
        }
        catch (err) {
            throw new common_1.InternalServerErrorException(err.message);
        }
    }
};
exports.ZatcaController = ZatcaController;
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ZatcaController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Post)('onboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZatcaController.prototype, "onboard", null);
__decorate([
    (0, common_1.Post)('complete-onboarding'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ZatcaController.prototype, "completeOnboarding", null);
exports.ZatcaController = ZatcaController = __decorate([
    (0, common_1.Controller)('admin/zatca'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [zatca_onboarding_service_1.ZatcaOnboardingService,
        prisma_service_1.PrismaService])
], ZatcaController);
//# sourceMappingURL=zatca.controller.js.map