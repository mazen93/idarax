import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { TokenBlacklistService } from './token-blacklist.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    private tenantService;
    private tokenBlacklist;
    constructor(prisma: PrismaService, tenantService: TenantService, tokenBlacklist: TokenBlacklistService);
    validate(payload: any): Promise<{
        id: any;
        email: any;
        tenantId: any;
        branchId: any;
        role: any;
        name: any;
        jti: any;
        permissions: any;
    }>;
}
export {};
