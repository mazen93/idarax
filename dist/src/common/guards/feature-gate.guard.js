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
exports.FeatureGateGuard = exports.Feature = exports.CHECK_FEATURE = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
exports.CHECK_FEATURE = 'check_feature';
const Feature = (feature) => (0, common_1.SetMetadata)(exports.CHECK_FEATURE, feature);
exports.Feature = Feature;
let FeatureGateGuard = class FeatureGateGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.getAllAndOverride(exports.CHECK_FEATURE, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredFeature) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
        if (!tenantId) {
            throw new common_1.ForbiddenException('Tenant context missing');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { plan: true },
        });
        if (!tenant || !tenant.plan) {
            throw new common_1.ForbiddenException('Tenant has no active subscription plan');
        }
        const hasFeature = tenant.plan.features.includes(requiredFeature);
        if (!hasFeature) {
            throw new common_1.ForbiddenException(`The feature "${requiredFeature}" is not available on your current plan (${tenant.plan.name}). Please upgrade to Enterprise.`);
        }
        return true;
    }
};
exports.FeatureGateGuard = FeatureGateGuard;
exports.FeatureGateGuard = FeatureGateGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], FeatureGateGuard);
//# sourceMappingURL=feature-gate.guard.js.map