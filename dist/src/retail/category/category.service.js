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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let CategoryService = class CategoryService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.category.create({
            data: {
                ...dto,
                tenantId
            }
        });
    }
    async findAll(menuId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.category.findMany({
            where: {
                tenantId,
                ...(menuId ? { menus: { some: { menuId } } } : {})
            },
            include: {
                _count: { select: { products: true } },
                menus: { select: { menuId: true } }
            }
        });
    }
    async update(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.category.update({
            where: { id, tenantId },
            data: dto
        });
    }
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.category.delete({
            where: { id, tenantId }
        });
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], CategoryService);
//# sourceMappingURL=category.service.js.map