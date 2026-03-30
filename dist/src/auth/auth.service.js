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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const client_1 = require("@prisma/client");
const token_blacklist_service_1 = require("./token-blacklist.service");
const crypto_1 = require("crypto");
const audit_log_service_1 = require("../common/audit-log/audit-log.service");
const session_service_1 = require("./session.service");
const permissions_constants_1 = require("./permissions.constants");
const tenant_service_1 = require("../tenant/tenant.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    tokenBlacklist;
    auditLog;
    sessionService;
    tenantService;
    constructor(prisma, jwtService, tokenBlacklist, auditLog, sessionService, tenantService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.tokenBlacklist = tokenBlacklist;
        this.auditLog = auditLog;
        this.sessionService = sessionService;
        this.tenantService = tenantService;
    }
    async register(dto) {
        const existingUser = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.client.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                tenantId: dto.tenantId,
                role: dto.role || client_1.UserRole.STAFF,
            },
        });
        return this.signToken(user.id, user.email, user.tenantId, user.role, user.name, user.branchId ?? undefined);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            await this.auditLog.log({
                tenantId: user.tenantId,
                userId: user.id,
                userEmail: user.email,
                action: 'auth.login.failed',
                meta: { reason: 'invalid_password' },
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const requestedTenantId = this.tenantService.getTenantId();
        const isAdminRole = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
        if (requestedTenantId && user.tenantId !== requestedTenantId && !isAdminRole) {
            await this.auditLog.log({
                tenantId: user.tenantId,
                userId: user.id,
                userEmail: user.email,
                action: 'auth.login.denied',
                meta: { reason: 'tenant_mismatch', requestedTenantId },
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.auditLog.log({
            tenantId: user.tenantId,
            userId: user.id,
            userEmail: user.email,
            action: 'auth.login',
        });
        return this.signToken(user.id, user.email, user.tenantId, user.role, user.name, user.branchId ?? undefined);
    }
    async signToken(userId, email, tenantId, role, name, branchId, sessionMeta) {
        const user = await this.prisma.client.user.findUnique({
            where: { id: userId },
            include: {
                customRole: { include: { permissions: true } },
                permissions: true,
                tenant: { include: { plan: true } }
            }
        });
        const directPerms = user?.permissions?.map(p => p.action) || [];
        const rolePerms = user?.customRole?.permissions?.map(p => p.action) || [];
        const defaultPerms = permissions_constants_1.RoleDefaultPermissions[role] || [];
        const permissionArray = Array.from(new Set([...directPerms, ...rolePerms, ...defaultPerms]));
        const currentRole = user?.customRole?.name || role;
        const jti = (0, crypto_1.randomUUID)();
        let daysRemaining = 999;
        let isExpired = false;
        if (user?.tenant) {
            const expiryDate = user.tenant.subscriptionExpiresAt || user.tenant.trialExpiresAt;
            if (expiryDate) {
                const now = new Date();
                const diffMs = new Date(expiryDate).getTime() - now.getTime();
                daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                isExpired = daysRemaining < 0;
            }
        }
        const accessToken = await this.jwtService.signAsync({
            sub: userId,
            email,
            tenantId,
            role: currentRole,
            name,
            branchId,
            permissions: permissionArray,
            features: user?.tenant?.plan?.features || [],
            isExpired,
            daysRemaining,
            jti,
        }, { expiresIn: '1h' });
        const refreshToken = await this.jwtService.signAsync({ sub: userId, jti, type: 'refresh' }, { expiresIn: '7d' });
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        if (sessionMeta?.existingSessionId) {
            await this.prisma.client.userSession.update({
                where: { id: sessionMeta.existingSessionId },
                data: {
                    jti,
                    hashedRefreshToken,
                    lastSeenAt: new Date(),
                },
            });
        }
        else {
            await this.sessionService.createSession({
                userId,
                tenantId,
                jti,
                deviceName: sessionMeta?.deviceName,
                ipAddress: sessionMeta?.ipAddress,
                hashedRefreshToken,
            });
        }
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            tenantId,
            branchId: branchId ?? null,
            role: currentRole,
            name,
            permissions: permissionArray,
            features: user?.tenant?.plan?.features || [],
            isExpired,
            daysRemaining,
        };
    }
    async logout(token, userId, userEmail, tenantId) {
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            const jti = decoded.jti;
            if (jti) {
                const exp = decoded.exp;
                const now = Math.floor(Date.now() / 1000);
                const ttl = Math.max(exp - now, 0);
                await this.tokenBlacklist.blacklist(jti, ttl);
            }
            if (tenantId) {
                await this.auditLog.log({
                    tenantId,
                    userId,
                    userEmail,
                    action: 'auth.logout',
                    meta: { jti: decoded.jti },
                });
            }
        }
        catch {
        }
        return { message: 'Logged out successfully' };
    }
    async refreshToken(dto) {
        let decoded;
        try {
            decoded = await this.jwtService.verifyAsync(dto.refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (decoded.type !== 'refresh' || !decoded.jti) {
            throw new common_1.UnauthorizedException('Invalid token usage');
        }
        const session = await this.sessionService.findByJti(decoded.jti);
        if (!session || !session.isActive || !session.hashedRefreshToken) {
            if (session)
                await this.sessionService.revokeAllSessions(session.userId);
            throw new common_1.UnauthorizedException('Session expired or revoked');
        }
        const isMatch = await bcrypt.compare(dto.refreshToken, session.hashedRefreshToken);
        if (!isMatch) {
            await this.sessionService.revokeAllSessions(session.userId);
            throw new common_1.UnauthorizedException('Security breach detected. All sessions revoked.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: session.userId }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User no longer exists');
        }
        await this.tokenBlacklist.blacklist(session.jti, 3600);
        return this.signToken(user.id, user.email, user.tenantId, user.role, user.name, user.branchId ?? undefined, { existingSessionId: session.id });
    }
    async loginByPin(dto) {
        const user = await this.prisma.client.user.findFirst({
            where: {
                pinCode: dto.pin,
                tenantId: dto.tenantId,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid PIN or Store ID');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        return this.signToken(user.id, user.email, user.tenantId, user.role, user.name, user.branchId ?? undefined);
    }
    async verifyOverride(dto) {
        const user = await this.prisma.client.user.findFirst({
            where: {
                pinCode: dto.pin,
                tenantId: dto.tenantId,
            },
            include: { permissions: true, customRole: { include: { permissions: true } } }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid PIN or Store ID');
        }
        const directPerms = user.permissions?.map((p) => p.action) || [];
        const rolePerms = user.customRole?.permissions?.map((p) => p.action) || [];
        const permissionArray = Array.from(new Set([...directPerms, ...rolePerms]));
        const isManager = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
        const hasAction = permissionArray.some((action) => action === dto.action || action.startsWith(`${dto.action}:`));
        if (!isManager && !hasAction) {
            throw new common_1.UnauthorizedException('User does not have permission for this action');
        }
        const currentRole = user.customRole?.name || user.role;
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            role: currentRole,
            name: user.name,
            branchId: user.branchId ?? undefined,
            permissions: permissionArray,
            isOverride: true,
        };
        const overrideToken = await this.jwtService.signAsync(payload, { expiresIn: '5m' });
        return {
            override_token: overrideToken,
            managerName: user.name,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        token_blacklist_service_1.TokenBlacklistService,
        audit_log_service_1.AuditLogService,
        session_service_1.SessionService,
        tenant_service_1.TenantService])
], AuthService);
//# sourceMappingURL=auth.service.js.map