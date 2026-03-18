import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto, PinLoginDto, VerifyOverrideDto } from './dto/auth.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { SessionService } from './session.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private tokenBlacklist;
    private auditLog;
    private sessionService;
    constructor(prisma: PrismaService, jwtService: JwtService, tokenBlacklist: TokenBlacklistService, auditLog: AuditLogService, sessionService: SessionService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
    }>;
    signToken(userId: string, email: string, tenantId: string, role: string, name: string, branchId?: string, sessionMeta?: {
        deviceName?: string;
        ipAddress?: string;
        existingSessionId?: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
    }>;
    logout(token: string, userId?: string, userEmail?: string, tenantId?: string): Promise<{
        message: string;
    }>;
    refreshToken(dto: {
        refreshToken: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
    }>;
    loginByPin(dto: PinLoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
    }>;
    verifyOverride(dto: VerifyOverrideDto): Promise<{
        override_token: string;
        managerName: string;
    }>;
}
