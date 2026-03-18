import { PrismaService } from '../prisma/prisma.service';
import { TokenBlacklistService } from './token-blacklist.service';
export declare class SessionService {
    private readonly prisma;
    private readonly tokenBlacklist;
    constructor(prisma: PrismaService, tokenBlacklist: TokenBlacklistService);
    createSession(dto: {
        userId: string;
        tenantId: string;
        jti: string;
        deviceName?: string;
        ipAddress?: string;
        hashedRefreshToken?: string;
    }): Promise<any>;
    getUserSessions(userId: string): Promise<any>;
    revokeSession(jti: string, userId: string): Promise<{
        message: string;
        jti?: undefined;
    } | {
        message: string;
        jti: string;
    }>;
    revokeAllSessions(userId: string): Promise<{
        message: string;
    }>;
    touchSession(jti: string): Promise<void>;
    findByJti(jti: string): Promise<any>;
    updateRefreshToken(id: string, hashedRefreshToken: string): Promise<any>;
}
