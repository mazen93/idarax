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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAdminController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TenantAdminController = class TenantAdminController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllTenants(req) {
        if (req.user?.role !== 'SUPER_ADMIN') {
            throw new common_1.UnauthorizedException('Superadmin access required');
        }
        const tenants = await this.prisma.tenant.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        orders: true,
                        products: true,
                    }
                },
                users: {
                    where: { role: 'ADMIN' },
                    select: { email: true, name: true, createdAt: true },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return tenants;
    }
};
exports.TenantAdminController = TenantAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantAdminController.prototype, "getAllTenants", null);
exports.TenantAdminController = TenantAdminController = __decorate([
    (0, common_1.Controller)('admin/tenants'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantAdminController);
//# sourceMappingURL=tenant.controller.js.map