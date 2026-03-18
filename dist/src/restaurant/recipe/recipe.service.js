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
exports.RecipeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let RecipeService = class RecipeService {
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
        const parent = await this.prisma.product.findUnique({
            where: { id: dto.parentId, tenantId },
        });
        if (!parent)
            throw new common_1.NotFoundException('Parent product not found');
        const ingredient = await this.prisma.product.findUnique({
            where: { id: dto.ingredientId, tenantId },
        });
        if (!ingredient)
            throw new common_1.NotFoundException('Ingredient product not found');
        return this.prisma.productRecipe.create({
            data: {
                parentId: dto.parentId,
                ingredientId: dto.ingredientId,
                quantity: dto.quantity,
                unit: dto.unit || 'unit',
            },
            include: {
                ingredient: { select: { name: true, costPrice: true } },
            },
        });
    }
    async findByProduct(productId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.productRecipe.findMany({
            where: {
                parentId: productId,
                parent: { tenantId }
            },
            include: {
                ingredient: { select: { name: true, sku: true, costPrice: true } },
            },
        });
    }
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const recipe = await this.prisma.productRecipe.findUnique({
            where: { id },
            include: { parent: true },
        });
        if (!recipe || recipe.parent.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Recipe component not found');
        }
        return this.prisma.productRecipe.delete({ where: { id } });
    }
};
exports.RecipeService = RecipeService;
exports.RecipeService = RecipeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], RecipeService);
//# sourceMappingURL=recipe.service.js.map