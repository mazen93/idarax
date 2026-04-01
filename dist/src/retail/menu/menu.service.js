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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let MenuService = class MenuService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    get db() {
        return this.prisma;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const { categoryIds, ...menuData } = dto;
        return this.db.menu.create({
            data: {
                ...menuData,
                tenantId,
                categories: {
                    create: categoryIds.map(categoryId => ({ categoryId }))
                }
            },
            include: { categories: { include: { category: true } } }
        });
    }
    async findAll(branchId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.db.menu.findMany({
            where: {
                tenantId,
                OR: [
                    { branchId: branchId || null },
                    { branchId: null }
                ]
            },
            include: { categories: { include: { category: true } } }
        });
    }
    async findActive(branchId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5);
        const currentDay = now.getDay();
        const allMenus = await this.db.menu.findMany({
            where: {
                tenantId,
                OR: [
                    { branchId: branchId || null },
                    { branchId: null }
                ],
            },
            include: { categories: { include: { category: true } } }
        });
        return allMenus.filter((menu) => {
            if (!menu.daysOfWeek || menu.daysOfWeek.length === 0) {
                return true;
            }
            if (!menu.daysOfWeek.includes(currentDay)) {
                return false;
            }
            if (!menu.startTime || !menu.endTime) {
                return true;
            }
            if (menu.startTime <= menu.endTime) {
                return currentTime >= menu.startTime && currentTime <= menu.endTime;
            }
            else {
                return currentTime >= menu.startTime || currentTime <= menu.endTime;
            }
        });
    }
    async findOne(id) {
        const tenantId = this.tenantService.getTenantId();
        const menu = await this.db.menu.findUnique({
            where: { id },
            include: { categories: { include: { category: true } } }
        });
        if (!menu || menu.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Menu not found');
        }
        return menu;
    }
    async update(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        const { categoryIds, ...menuData } = dto;
        await this.findOne(id);
        return this.prisma.$transaction(async (tx) => {
            if (categoryIds) {
                await tx.menuCategory.deleteMany({ where: { menuId: id } });
                await tx.menuCategory.createMany({
                    data: categoryIds.map(categoryId => ({ menuId: id, categoryId }))
                });
            }
            return tx.menu.update({
                where: { id, tenantId },
                data: menuData,
                include: { categories: { include: { category: true } } }
            });
        });
    }
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        await this.findOne(id);
        return this.db.menu.delete({
            where: { id, tenantId }
        });
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], MenuService);
//# sourceMappingURL=menu.service.js.map