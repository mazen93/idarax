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
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const token_blacklist_service_1 = require("./token-blacklist.service");
let SessionService = class SessionService {
    prisma;
    tokenBlacklist;
    constructor(prisma, tokenBlacklist) {
        this.prisma = prisma;
        this.tokenBlacklist = tokenBlacklist;
    }
    async createSession(dto) {
        return this.prisma.userSession.create({ data: dto });
    }
    async getUserSessions(userId) {
        return this.prisma.userSession.findMany({
            where: { userId, isActive: true },
            orderBy: { lastSeenAt: 'desc' },
        });
    }
    async revokeSession(jti, userId) {
        const session = await this.prisma.userSession.findFirst({
            where: { jti, userId, isActive: true },
        });
        if (!session)
            return { message: 'Session not found or already revoked' };
        await this.prisma.userSession.update({
            where: { id: session.id },
            data: { isActive: false },
        });
        await this.tokenBlacklist.blacklist(jti, 3600);
        return { message: 'Session revoked', jti };
    }
    async revokeAllSessions(userId) {
        const sessions = await this.prisma.userSession.findMany({
            where: { userId, isActive: true },
        });
        for (const session of sessions) {
            await this.tokenBlacklist.blacklist(session.jti, 3600);
        }
        await this.prisma.userSession.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        });
        return { message: `Revoked ${sessions.length} session(s)` };
    }
    async touchSession(jti) {
        await this.prisma.userSession.updateMany({
            where: { jti, isActive: true },
            data: { lastSeenAt: new Date() },
        });
    }
    async findByJti(jti) {
        return this.prisma.userSession.findUnique({
            where: { jti },
        });
    }
    async updateRefreshToken(id, hashedRefreshToken) {
        return this.prisma.userSession.update({
            where: { id },
            data: { hashedRefreshToken, lastSeenAt: new Date() },
        });
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_blacklist_service_1.TokenBlacklistService])
], SessionService);
//# sourceMappingURL=session.service.js.map