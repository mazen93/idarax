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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenant_service_1 = require("./tenant.service");
const prisma_service_1 = require("../prisma/prisma.service");
const domainCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;
let TenantMiddleware = class TenantMiddleware {
    tenantService;
    prisma;
    constructor(tenantService, prisma) {
        this.tenantService = tenantService;
        this.prisma = prisma;
    }
    async use(req, res, next) {
        let tenantId = req.headers['x-tenant-id'];
        const branchId = req.headers['x-branch-id'] || undefined;
        if (!tenantId) {
            const host = req.hostname;
            if (host && !host.includes('localhost') && !host.includes('idarax.com') && !host.includes('127.0.0.1')) {
                const now = Date.now();
                const cached = domainCache.get(host);
                if (cached && cached.expires > now) {
                    if (cached.id)
                        tenantId = cached.id;
                }
                else {
                    const tenant = await this.prisma.tenant.findUnique({
                        where: { domain: host }
                    });
                    domainCache.set(host, { id: tenant?.id || null, expires: now + CACHE_TTL });
                    if (tenant) {
                        tenantId = tenant.id;
                    }
                }
            }
        }
        if (tenantId) {
            this.tenantService.setContext(tenantId, branchId);
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_service_1.TenantService,
        prisma_service_1.PrismaService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map