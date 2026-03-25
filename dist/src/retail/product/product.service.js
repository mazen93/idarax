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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
let ProductService = class ProductService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    get db() {
        return this.prisma.client.product;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const { variants, recipeComponents, ...rest } = dto;
        if (dto.barcode) {
            const existing = await this.db.findUnique({
                where: { barcode_tenantId: { barcode: dto.barcode, tenantId } },
            });
            if (existing)
                throw new common_1.ConflictException('Barcode already exists for this tenant');
        }
        let costPrice = dto.productType === 'COMBO' ? 0 : rest.costPrice || 0;
        let sellPrice = dto.productType === 'COMBO' ? 0 : rest.price || 0;
        if (dto.productType === 'COMBO' && recipeComponents?.length) {
            for (const component of recipeComponents) {
                if (component.variantId) {
                    const variant = await this.prisma.client.variant.findUnique({
                        where: { id: component.variantId }
                    });
                    if (variant) {
                        costPrice += Number(variant.costPrice) * component.quantity;
                        sellPrice += Number(variant.price || 0) * component.quantity;
                    }
                }
                else {
                    const ingredient = await this.db.findUnique({
                        where: { id: component.ingredientId }
                    });
                    if (ingredient) {
                        costPrice += Number(ingredient.costPrice) * component.quantity;
                        sellPrice += Number(ingredient.price) * component.quantity;
                    }
                }
            }
        }
        return this.db.create({
            data: {
                ...rest,
                defaultStationId: rest.defaultStationId || null,
                costPrice,
                variants: variants?.length ? {
                    create: variants.map(v => ({
                        name: v.name,
                        price: v.price ?? rest.price,
                        costPrice: v.costPrice ?? 0,
                        sku: v.sku?.trim() || null
                    })),
                } : undefined,
                recipeComponents: recipeComponents?.length ? {
                    create: recipeComponents.map(rc => ({
                        ingredientId: rc.ingredientId,
                        variantId: rc.variantId,
                        quantity: rc.quantity,
                        unit: rc.unit || 'unit'
                    }))
                } : undefined,
                price: dto.productType === 'COMBO' ? (rest.price && Number(rest.price) > 0 ? rest.price : sellPrice) : rest.price,
                modifiers: dto.modifiers?.length ? {
                    create: dto.modifiers.map(m => ({
                        name: m.name,
                        required: m.required ?? false,
                        multiSelect: m.multiSelect ?? false,
                        sortOrder: m.sortOrder ?? 0,
                        options: m.options?.length ? {
                            create: m.options.map(o => ({
                                name: o.name,
                                priceAdjust: o.priceAdjust ?? 0,
                                sortOrder: o.sortOrder ?? 0
                            }))
                        } : undefined
                    }))
                } : undefined
            },
            include: {
                variants: true,
                recipeComponents: { include: { ingredient: true } },
                category: { select: { id: true, name: true } },
                modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
            },
        });
    }
    async findAll(branchId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            include: {
                variants: true,
                category: { select: { id: true, name: true } },
                stockLevels: { include: { warehouse: { select: { name: true } } } },
                modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
                recipeComponents: { include: { ingredient: true } },
                branchSettings: branchId ? { where: { branchId } } : false,
            },
        });
        if (!branchId) {
            return products;
        }
        return products
            .filter((p) => {
            const setting = p.branchSettings?.[0];
            return !setting || setting.isAvailable;
        })
            .map((p) => {
            const setting = p.branchSettings?.[0];
            const { branchSettings, ...product } = p;
            return {
                ...product,
                price: setting?.priceOverride ?? product.price,
                branchOverride: setting ? {
                    isAvailable: setting.isAvailable,
                    priceOverride: setting.priceOverride,
                } : null,
            };
        });
    }
    async findByBarcode(barcode) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.db.findUnique({
            where: { barcode_tenantId: { barcode, tenantId } },
            include: { variants: true, modifiers: { include: { options: true } } },
        });
    }
    async findOne(id) {
        const product = await this.db.findUnique({
            where: { id },
            include: {
                variants: true,
                recipeComponents: { include: { ingredient: true } },
                category: { select: { id: true, name: true } },
                modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
            },
        });
        if (!product) {
            throw new common_1.ForbiddenException('Product not found or access denied');
        }
        return product;
    }
    async update(id, dto) {
        const product = await this.findOne(id);
        const { variants, recipeComponents, ...rest } = dto;
        return this.prisma.client.$transaction(async (tx) => {
            if (variants !== undefined) {
                await tx.variant.deleteMany({ where: { productId: id } });
            }
            if (recipeComponents !== undefined) {
                await tx.productRecipe.deleteMany({ where: { parentId: id } });
            }
            let costPrice = rest.productType === 'COMBO' || product.productType === 'COMBO' ? 0 : rest.costPrice ?? Number(product.costPrice);
            let sellPrice = rest.productType === 'COMBO' || product.productType === 'COMBO' ? 0 : rest.price ?? Number(product.price);
            if ((rest.productType === 'COMBO' || (rest.productType === undefined && product.productType === 'COMBO')) && (recipeComponents || product.recipeComponents)) {
                const activeComponents = recipeComponents || (await tx.productRecipe.findMany({ where: { parentId: id } }));
                for (const component of activeComponents) {
                    if (component.variantId) {
                        const variant = await tx.variant.findUnique({ where: { id: component.variantId } });
                        if (variant) {
                            costPrice += (Number(variant.costPrice) || 0) * component.quantity;
                            sellPrice += (Number(variant.price) || 0) * component.quantity;
                        }
                    }
                    else {
                        const ingredient = await tx.product.findUnique({ where: { id: component.ingredientId } });
                        if (ingredient) {
                            costPrice += (Number(ingredient.costPrice) || 0) * component.quantity;
                            sellPrice += (Number(ingredient.price) || 0) * component.quantity;
                        }
                    }
                }
            }
            return tx.product.update({
                where: { id },
                data: {
                    ...rest,
                    costPrice,
                    ...(variants !== undefined && {
                        variants: {
                            create: variants.map(v => ({
                                name: v.name,
                                price: v.price,
                                costPrice: v.costPrice ?? 0,
                                sku: v.sku?.trim() || null,
                            })),
                        },
                    }),
                    ...(recipeComponents !== undefined && {
                        recipeComponents: {
                            create: recipeComponents.map(rc => ({
                                ingredientId: rc.ingredientId,
                                variantId: rc.variantId,
                                quantity: rc.quantity,
                                unit: rc.unit || 'unit'
                            })),
                        },
                    }),
                    price: (rest.productType === 'COMBO' || (rest.productType === undefined && product.productType === 'COMBO'))
                        ? (rest.price && Number(rest.price) > 0 ? rest.price : (sellPrice > 0 ? sellPrice : Number(product.price)))
                        : (rest.price ?? product.price),
                },
                include: {
                    variants: true,
                    recipeComponents: true,
                    category: { select: { id: true, name: true } },
                    modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
                },
            });
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.client.variant.deleteMany({ where: { productId: id } });
        return this.db.delete({
            where: { id },
        });
    }
    async getBranchSettings(branchId) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            select: {
                id: true,
                name: true,
                price: true,
                category: { select: { id: true, name: true } },
                productType: true,
                isSellable: true,
                branchSettings: { where: { branchId } },
            },
        });
        return products.map((p) => {
            const setting = p.branchSettings?.[0];
            return {
                productId: p.id,
                name: p.name,
                basePrice: p.price,
                category: p.category,
                productType: p.productType,
                isSellable: p.isSellable,
                isAvailable: setting ? setting.isAvailable : true,
                priceOverride: setting?.priceOverride ?? null,
                defaultStationId: setting?.defaultStationId ?? null,
            };
        });
    }
    async upsertBranchSetting(branchId, productId, dto) {
        const product = await this.db.findUnique({ where: { id: productId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.prisma.client.branchProduct.upsert({
            where: { branchId_productId: { branchId, productId } },
            create: {
                branchId,
                productId,
                isAvailable: dto.isAvailable,
                priceOverride: dto.priceOverride ?? null,
                defaultStationId: dto.defaultStationId ?? null,
            },
            update: {
                isAvailable: dto.isAvailable,
                priceOverride: dto.priceOverride ?? null,
                defaultStationId: dto.defaultStationId ?? null,
            },
        });
    }
    async resetBranchSetting(branchId, productId) {
        return this.prisma.client.branchProduct.deleteMany({
            where: { branchId, productId },
        });
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], ProductService);
//# sourceMappingURL=product.service.js.map