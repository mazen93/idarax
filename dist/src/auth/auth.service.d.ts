import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto, PinLoginDto, VerifyOverrideDto } from './dto/auth.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { SessionService } from './session.service';
import { TenantService } from '../tenant/tenant.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private tokenBlacklist;
    private auditLog;
    private sessionService;
    private tenantService;
    constructor(prisma: PrismaService, jwtService: JwtService, tokenBlacklist: TokenBlacklistService, auditLog: AuditLogService, sessionService: SessionService, tenantService: TenantService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
        features: string[];
        tenantType: import(".prisma/client").$Enums.TenantType;
        isExpired: boolean;
        daysRemaining: number;
        isTenantActive: boolean;
        tenantStatus: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
        features: string[];
        tenantType: import(".prisma/client").$Enums.TenantType;
        isExpired: boolean;
        daysRemaining: number;
        isTenantActive: boolean;
        tenantStatus: string;
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
        features: string[];
        tenantType: import(".prisma/client").$Enums.TenantType;
        isExpired: boolean;
        daysRemaining: number;
        isTenantActive: boolean;
        tenantStatus: string;
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
        features: string[];
        tenantType: import(".prisma/client").$Enums.TenantType;
        isExpired: boolean;
        daysRemaining: number;
        isTenantActive: boolean;
        tenantStatus: string;
    }>;
    loginByPin(dto: PinLoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
        features: string[];
        tenantType: import(".prisma/client").$Enums.TenantType;
        isExpired: boolean;
        daysRemaining: number;
        isTenantActive: boolean;
        tenantStatus: string;
    }>;
    verifyOverride(dto: VerifyOverrideDto): Promise<{
        override_token: string;
        managerName: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        tenantId: string;
        branchId: string | null;
        permissions: any[];
        features: string[];
        tenantType: import(".prisma/client").$Enums.TenantType;
        isTenantActive: boolean;
        tenantStatus: string;
    }>;
}
