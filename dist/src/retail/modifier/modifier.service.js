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
exports.ModifierService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let ModifierService = class ModifierService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async getForProduct(productId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.productModifier.findMany({
            where: { productId },
            include: { options: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async createGroup(productId, dto) {
        return this.prisma.client.productModifier.create({
            data: {
                productId,
                name: dto.name,
                required: dto.required ?? false,
                multiSelect: dto.multiSelect ?? false,
                sortOrder: dto.sortOrder ?? 0,
            },
            include: { options: true },
        });
    }
    async updateGroup(modifierId, dto) {
        return this.prisma.client.productModifier.update({
            where: { id: modifierId },
            data: dto,
            include: { options: { orderBy: { sortOrder: 'asc' } } },
        });
    }
    async deleteGroup(modifierId) {
        return this.prisma.client.productModifier.delete({ where: { id: modifierId } });
    }
    async addOption(modifierId, dto) {
        return this.prisma.client.productModifierOption.create({
            data: {
                modifierId,
                name: dto.name,
                priceAdjust: dto.priceAdjust ?? 0,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }
    async updateOption(optionId, dto) {
        return this.prisma.client.productModifierOption.update({
            where: { id: optionId },
            data: dto,
        });
    }
    async deleteOption(optionId) {
        return this.prisma.client.productModifierOption.delete({ where: { id: optionId } });
    }
};
exports.ModifierService = ModifierService;
exports.ModifierService = ModifierService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], ModifierService);
//# sourceMappingURL=modifier.service.js.map