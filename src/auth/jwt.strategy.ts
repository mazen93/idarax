import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        private tokenBlacklist: TokenBlacklistService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey',
        });
    }

    async validate(payload: any) {
        // Check if this token has been blacklisted (i.e., user logged out)
        if (payload.jti) {
            const isBlacklisted = await this.tokenBlacklist.isBlacklisted(payload.jti);
            if (isBlacklisted) {
                throw new UnauthorizedException('Token has been revoked');
            }
        }

        // Basic security check: verify user still exists in DB
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new UnauthorizedException();
        }

        // Branch Isolation: Restrict non-admin users to their assigned branch
        if (payload.branchId && !['SUPER_ADMIN', 'ADMIN'].includes(payload.role)) {
            // Overwrite any header-provided branchId with the user's assigned one
            this.tenantService.setBranchId(payload.branchId);
        }

        // Return the payload data so it's directly available on req.user in guards
        return {
            id: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            branchId: payload.branchId,
            role: payload.role,
            name: payload.name,
            jti: payload.jti,
            permissions: payload.permissions || [],
        };
    }
}
