import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto, PinLoginDto, VerifyOverrideDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';
import { TokenBlacklistService } from './token-blacklist.service';
import { randomUUID } from 'crypto';
import { AuditLogService } from '../common/audit-log/audit-log.service';
import { SessionService } from './session.service';
import { RoleDefaultPermissions } from './permissions.constants';
import { TenantService } from '../tenant/tenant.service';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private tokenBlacklist: TokenBlacklistService,
        private auditLog: AuditLogService,
        private sessionService: SessionService,
        private tenantService: TenantService,
    ) { }


    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.client.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.client.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                name: dto.name,
                tenantId: dto.tenantId,
                role: (dto.role as UserRole) || UserRole.STAFF,
            },
        });

        return this.signToken(user.id, user.email, user.tenantId, user.role, user.name, user.branchId ?? undefined);
    }

    async login(dto: LoginDto) {
        // Use the base prisma model (bypassing the tenant filter) to find the user globally by email
        const user = await (this.prisma as any).user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        const passwordMatches = await bcrypt.compare(dto.password, user.password);

        if (!passwordMatches) {
            // Audit failed login attempt
            await this.auditLog.log({
                tenantId: user.tenantId,
                userId: user.id,
                userEmail: user.email,
                action: 'auth.login.failed',
                meta: { reason: 'invalid_password' },
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // If a tenant context was provided (e.g. from x-tenant-id header), 
        // verify that the user belongs to that specific tenant.
        // SUPER_ADMIN and ADMIN (tenant owners) bypass this check as they may be logging in globally.
        const requestedTenantId = this.tenantService.getTenantId();
        const isAdminRole = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';

        if (requestedTenantId && user.tenantId !== requestedTenantId && !isAdminRole) {
            // Log this as a failed login attempt for the user in the audit logs
            await this.auditLog.log({
                tenantId: user.tenantId,
                userId: user.id,
                userEmail: user.email,
                action: 'auth.login.denied',
                meta: { reason: 'tenant_mismatch', requestedTenantId },
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // Audit successful login
        await this.auditLog.log({
            tenantId: user.tenantId,
            userId: user.id,
            userEmail: user.email,
            action: 'auth.login',
        });

        return this.signToken(user.id, user.email, user.tenantId, user.role, user.name, user.branchId ?? undefined);
    }

    async signToken(
        userId: string,
        email: string,
        tenantId: string,
        role: string,
        name: string,
        branchId?: string,
        sessionMeta?: { deviceName?: string; ipAddress?: string; existingSessionId?: string },
    ) {
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
        
        // Include default permissions for built-in roles
        const defaultPerms = RoleDefaultPermissions[role] || [];
        
        const permissionArray = Array.from(new Set([...directPerms, ...rolePerms, ...defaultPerms]));

        const currentRole = user?.customRole?.name || role;
        const jti = randomUUID();

        // Calculate days remaining
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

        // Sign access token
        const accessToken = await this.jwtService.signAsync(
            {
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
            },
            { expiresIn: '1h' }
        );

        // Sign refresh token (also includes jti for rotation linkage)
        const refreshToken = await this.jwtService.signAsync(
            { sub: userId, jti, type: 'refresh' },
            { expiresIn: '7d' }
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        if (sessionMeta?.existingSessionId) {
            // Rotation: Update the existing session with the new JTI and hashed refresh token
            await (this.prisma.client as any).userSession.update({
                where: { id: sessionMeta.existingSessionId },
                data: {
                    jti,
                    hashedRefreshToken,
                    lastSeenAt: new Date(),
                },
            });
        } else {
            // New Session: Persist a new record
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

    async logout(token: string, userId?: string, userEmail?: string, tenantId?: string): Promise<{ message: string }> {
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            const jti = decoded.jti;
            if (jti) {
                const exp = decoded.exp;
                const now = Math.floor(Date.now() / 1000);
                const ttl = Math.max(exp - now, 0);
                await this.tokenBlacklist.blacklist(jti, ttl);
            }
            // Audit the logout
            if (tenantId) {
                await this.auditLog.log({
                    tenantId,
                    userId,
                    userEmail,
                    action: 'auth.logout',
                    meta: { jti: decoded.jti },
                });
            }
        } catch {
            // If the token is already invalid/expired, just ignore
        }
        return { message: 'Logged out successfully' };
    }

    async refreshToken(dto: { refreshToken: string }) {
        let decoded: any;
        try {
            decoded = await this.jwtService.verifyAsync(dto.refreshToken);
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (decoded.type !== 'refresh' || !decoded.jti) {
            throw new UnauthorizedException('Invalid token usage');
        }

        const session = await this.sessionService.findByJti(decoded.jti);

        // REUSE DETECTION: If session isn't found or has a different JTI now, someone might be using a stolen token.
        if (!session || !session.isActive || !session.hashedRefreshToken) {
            if (session) await this.sessionService.revokeAllSessions(session.userId);
            throw new UnauthorizedException('Session expired or revoked');
        }

        const isMatch = await bcrypt.compare(dto.refreshToken, session.hashedRefreshToken);
        if (!isMatch) {
            // Stolen token detection: If the refresh token doesn't match the current one in DB, revoke everything.
            await this.sessionService.revokeAllSessions(session.userId);
            throw new UnauthorizedException('Security breach detected. All sessions revoked.');
        }

        const user = await (this.prisma as any).user.findUnique({
            where: { id: session.userId }
        });


        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        // Before rotating, blacklist the old JTI so the associated access token is immediately invalid
        await this.tokenBlacklist.blacklist(session.jti, 3600);

        // Rotate: Sign new pair using the same session entry
        return this.signToken(
            user.id,
            user.email,
            user.tenantId,
            user.role,
            user.name,
            user.branchId ?? undefined,
            { existingSessionId: session.id }
        );
    }

    async loginByPin(dto: PinLoginDto) {
        const user = await this.prisma.client.user.findFirst({
            where: {
                pinCode: dto.pin,
                tenantId: dto.tenantId,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid PIN or Store ID');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        return this.signToken(user.id, user.email, user.tenantId, user.role, user.name, user.branchId ?? undefined);
    }
    async verifyOverride(dto: VerifyOverrideDto) {
        const user = await this.prisma.client.user.findFirst({
            where: {
                pinCode: dto.pin,
                tenantId: dto.tenantId,
            },
            include: { permissions: true, customRole: { include: { permissions: true } } }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid PIN or Store ID');
        }

        const directPerms = user.permissions?.map((p: any) => p.action) || [];
        const rolePerms = user.customRole?.permissions?.map((p: any) => p.action) || [];
        const permissionArray = Array.from(new Set([...directPerms, ...rolePerms]));

        // Check if this user has the required action or is a manager/admin
        const isManager = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user.role);
        const hasAction = permissionArray.some((action: string) => action === dto.action || action.startsWith(`${dto.action}:`));

        if (!isManager && !hasAction) {
            throw new UnauthorizedException('User does not have permission for this action');
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
}
