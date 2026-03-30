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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
const token_blacklist_service_1 = require("./token-blacklist.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    tenantService;
    tokenBlacklist;
    constructor(prisma, tenantService, tokenBlacklist) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey',
        });
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.tokenBlacklist = tokenBlacklist;
    }
    async validate(payload) {
        if (payload.jti) {
            const isBlacklisted = await this.tokenBlacklist.isBlacklisted(payload.jti);
            if (isBlacklisted) {
                throw new common_1.UnauthorizedException('Token has been revoked');
            }
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        if (payload.branchId && !['SUPER_ADMIN', 'ADMIN'].includes(payload.role)) {
            this.tenantService.setBranchId(payload.branchId);
        }
        return {
            id: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            branchId: payload.branchId,
            role: payload.role,
            jti: payload.jti,
            permissions: payload.permissions || [],
            features: payload.features || [],
            isExpired: payload.isExpired || false,
            daysRemaining: payload.daysRemaining || 999,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        token_blacklist_service_1.TokenBlacklistService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map