import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tokenBlacklist: TokenBlacklistService,
    ) {}

    /**
     * Called on every successful login — persists a session record.
     */
    async createSession(dto: {
        userId: string;
        tenantId: string;
        jti: string;
        deviceName?: string;
        ipAddress?: string;
        hashedRefreshToken?: string;
    }) {
        return (this.prisma as any).userSession.create({ data: dto });
    }

    /**
     * Returns all active sessions for a user (for the "Manage Devices" UI).
     */
    async getUserSessions(userId: string) {
        return (this.prisma as any).userSession.findMany({
            where: { userId, isActive: true },
            orderBy: { lastSeenAt: 'desc' },
        });
    }

    /**
     * Revokes a session by JTI (called when user clicks "Logout this device").
     * Also blacklists the token in Redis.
     */
    async revokeSession(jti: string, userId: string) {
        const session = await (this.prisma as any).userSession.findFirst({
            where: { jti, userId, isActive: true },
        });

        if (!session) return { message: 'Session not found or already revoked' };

        await (this.prisma as any).userSession.update({
            where: { id: session.id },
            data: { isActive: false },
        });

        // Blacklist for 1 hour (max access token lifespan)
        await this.tokenBlacklist.blacklist(jti, 3600);

        return { message: 'Session revoked', jti };
    }

    /**
     * Revokes ALL sessions for a user (logout everywhere).
     */
    async revokeAllSessions(userId: string) {
        const sessions = await (this.prisma as any).userSession.findMany({
            where: { userId, isActive: true },
        });

        for (const session of sessions) {
            await this.tokenBlacklist.blacklist(session.jti, 3600);
        }

        await (this.prisma as any).userSession.updateMany({
            where: { userId, isActive: true },
            data: { isActive: false },
        });

        return { message: `Revoked ${sessions.length} session(s)` };
    }

    /**
     * Update last seen timestamp — call this on authenticated API requests.
     */
    async touchSession(jti: string) {
        await (this.prisma as any).userSession.updateMany({
            where: { jti, isActive: true },
            data: { lastSeenAt: new Date() },
        });
    }

    async findByJti(jti: string) {
        return (this.prisma as any).userSession.findUnique({
            where: { jti },
        });
    }

    async updateRefreshToken(id: string, hashedRefreshToken: string) {
        return (this.prisma as any).userSession.update({
            where: { id },
            data: { hashedRefreshToken, lastSeenAt: new Date() },
        });
    }
}
