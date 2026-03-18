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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
let RoleService = class RoleService {
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
        const existing = await this.prisma.client.role.findFirst({
            where: { name: dto.name, tenantId }
        });
        if (existing)
            throw new common_1.ConflictException(`Role with name ${dto.name} already exists`);
        const role = await this.prisma.client.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                tenantId,
                permissions: {
                    create: dto.permissions.map(action => ({ action, tenantId }))
                }
            },
            include: { permissions: { select: { action: true } } }
        });
        return {
            ...role,
            permissions: role.permissions.map((p) => p.action)
        };
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const roles = await this.prisma.client.role.findMany({
            where: { tenantId },
            include: { permissions: { select: { action: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return roles.map((r) => ({
            ...r,
            permissions: r.permissions.map((p) => p.action)
        }));
    }
    async findOne(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const role = await this.prisma.client.role.findUnique({
            where: { id },
            include: { permissions: { select: { action: true } } }
        });
        if (!role || role.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Role not found');
        }
        return {
            ...role,
            permissions: role.permissions.map((p) => p.action)
        };
    }
    async update(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const role = await this.prisma.client.role.findUnique({ where: { id } });
        if (!role || role.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Role not found');
        }
        if (dto.name && dto.name !== role.name) {
            const existing = await this.prisma.client.role.findFirst({
                where: { name: dto.name, tenantId, id: { not: id } }
            });
            if (existing)
                throw new common_1.ConflictException(`Role with name ${dto.name} already exists`);
        }
        const data = {};
        if (dto.name)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        await this.prisma.client.role.update({
            where: { id },
            data
        });
        if (dto.permissions) {
            await this.prisma.client.rolePermission.deleteMany({ where: { roleId: id } });
            if (dto.permissions.length > 0) {
                await this.prisma.client.rolePermission.createMany({
                    data: dto.permissions.map(action => ({ action, roleId: id, tenantId }))
                });
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const role = await this.prisma.client.role.findUnique({ where: { id } });
        if (!role || role.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Role not found');
        }
        await this.prisma.client.role.delete({ where: { id } });
        return { success: true };
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], RoleService);
//# sourceMappingURL=role.service.js.map