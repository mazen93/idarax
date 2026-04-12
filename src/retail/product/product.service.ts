import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { UpsertBranchProductDto } from './dto/branch-product.dto';

@Injectable()
export class ProductService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    private get db() {
        return this.prisma.client.product;
    }

    async create(dto: CreateProductDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const { variants, recipeComponents, ...rest } = dto;

        // Check for existing barcode/sku in this tenant
        if (dto.barcode) {
            const existing = await this.db.findUnique({
                where: { barcode_tenantId: { barcode: dto.barcode, tenantId } },
            });
            if (existing) throw new ConflictException('Barcode already exists for this tenant');
        }

        let costPrice = (rest as any).costPrice || 0;
        let sellPrice = rest.price || 0;

        // Automatically calculate cost and price if recipe components are provided
        if (recipeComponents?.length) {
            let calculatedCost = 0;
            let calculatedSell = 0;
            for (const component of recipeComponents) {
                if (component.variantId) {
                    const variant = await this.prisma.client.variant.findUnique({
                        where: { id: component.variantId }
                    });
                    if (variant) {
                        calculatedCost += Number(variant.costPrice || 0) * component.quantity;
                        calculatedSell += Number(variant.price || 0) * component.quantity;
                    }
                } else {
                    const ingredient = await this.db.findUnique({
                        where: { id: component.ingredientId }
                    });
                    if (ingredient) {
                        calculatedCost += Number(ingredient.costPrice || 0) * component.quantity;
                        calculatedSell += Number(ingredient.price || 0) * component.quantity;
                    }
                }
            }
            // Always overwrite cost with calculated cost from ingredients
            if (calculatedCost > 0) {
                costPrice = calculatedCost;
            }
            
            // For Combo, also default the sell price if not provided
            if (dto.productType === 'COMBO' && sellPrice === 0) {
                sellPrice = calculatedSell;
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
            } as any,
            include: {
                variants: true,
                recipeComponents: { include: { ingredient: true } },
                category: { select: { id: true, name: true } },
                modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
            },
        });
    }

    /**
     * Find all products for a tenant.
     * If branchId is provided:
     *  - filters out products with isAvailable=false for that branch
     *  - overrides price with branchSettings.priceOverride if set
     */
    async findAll(branchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Use rawClient to avoid the global query extension injecting tenantId/branchId
        // into nested include queries (e.g. stockLevels → warehouse), which causes
        // a "column (not available)" error with the Prisma WASM adapter-pg engine.
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
            // Return catalog as-is with no branch filtering
            return products;
        }

        // Apply branch overrides: filter unavailable, merge price override
        return products
            .filter((p: any) => {
                const setting = (p as any).branchSettings?.[0];
                // No override = available by default
                return !setting || setting.isAvailable;
            })
            .map((p: any) => {
                const setting = (p as any).branchSettings?.[0];
                const { branchSettings, ...product } = p as any;
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

    async findByBarcode(barcode: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return this.db.findUnique({
            where: { barcode_tenantId: { barcode, tenantId } },
            include: { variants: true, modifiers: { include: { options: true } } },
        });
    }

    async findOne(id: string) {
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
            throw new ForbiddenException('Product not found or access denied');
        }

        return product;
    }

    async update(id: string, dto: UpdateProductDto) {
        const product = await this.findOne(id);

        const { variants, recipeComponents, ...rest } = dto;

        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Check for existing barcode/sku in this tenant if it's being changed
        if (dto.barcode && dto.barcode !== product.barcode) {
            const existing = await this.db.findUnique({
                where: { barcode_tenantId: { barcode: dto.barcode, tenantId } },
            });
            if (existing) throw new ConflictException('Barcode already exists for this tenant');
        }

        if (dto.sku && dto.sku !== product.sku) {
            const existing = await this.db.findUnique({
                where: { sku_tenantId: { sku: dto.sku, tenantId } },
            });
            if (existing) throw new ConflictException('SKU already exists for this tenant');
        }

        // Run in a transaction: update fields + replace variants/recipes
        return (this.prisma.client as any).$transaction(async (tx: any) => {
            if (variants !== undefined) {
                await tx.variant.deleteMany({ where: { productId: id } });
            }
            if (recipeComponents !== undefined) {
                await tx.productRecipe.deleteMany({ where: { parentId: id } });
            }

            let costPrice = (rest as any).costPrice ?? Number(product.costPrice);
            let sellPrice = (rest.price !== undefined) ? Number(rest.price) : Number(product.price);

            // Recalculate cost if combo components or recipe components are updated
            if (recipeComponents || (product.recipeComponents && product.recipeComponents.length > 0)) {
                const isCombo = rest.productType === 'COMBO' || product.productType === 'COMBO';
                const activeComponents = recipeComponents || (await tx.productRecipe.findMany({ where: { parentId: id } }));
                
                let calculatedCost = 0;
                let calculatedSell = 0;
                for (const component of activeComponents) {
                    if (component.variantId) {
                        const variant = await tx.variant.findUnique({ where: { id: component.variantId } });
                        if (variant) {
                            calculatedCost += (Number(variant.costPrice) || 0) * component.quantity;
                            calculatedSell += (Number(variant.price) || 0) * component.quantity;
                        }
                    } else {
                        const ingredient = await tx.product.findUnique({ where: { id: component.ingredientId } });
                        if (ingredient) {
                            calculatedCost += (Number(ingredient.costPrice) || 0) * component.quantity;
                            calculatedSell += (Number(ingredient.price) || 0) * component.quantity;
                        }
                    }
                }

                // Always use the calculated recipe cost if greater than zero
                if (calculatedCost > 0) {
                    costPrice = calculatedCost;
                }

                // For combo products, also default the sell price if not explicitly provided
                if (isCombo && rest.price === undefined) {
                    sellPrice = calculatedSell;
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

    async remove(id: string) {
        await this.findOne(id);

        // Delete variants first to avoid FK constraint
        await this.prisma.client.variant.deleteMany({ where: { productId: id } });

        return this.db.delete({
            where: { id },
        });
    }

    // ─── Branch Product Settings ────────────────────────────────────────────

    /**
     * Get all branch overrides for a specific branch.
     * Returns full product list with override status merged in.
     */
    async getBranchSettings(branchId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Use unextended client (this.prisma) to avoid the global query extension injecting filters
        // into nested include queries for related models.
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

        return products.map((p: any) => {
            const setting = (p as any).branchSettings?.[0];
            return {
                productId: p.id,
                name: p.name,
                basePrice: p.price,
                category: p.category,
                productType: p.productType,
                isSellable: p.isSellable,
                isAvailable: setting ? setting.isAvailable : true, // default available
                priceOverride: setting?.priceOverride ?? null,
                defaultStationId: setting?.defaultStationId ?? null,
            };
        });
    }

    /**
     * Upsert a branch-level override for one product.
     */
    async upsertBranchSetting(branchId: string, productId: string, dto: UpsertBranchProductDto) {
        // Verify product exists
        const product = await this.db.findUnique({ where: { id: productId } });
        if (!product) throw new NotFoundException('Product not found');

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

    /**
     * Reset a branch-product override (make it follow global defaults again).
     */
    async resetBranchSetting(branchId: string, productId: string) {
        return this.prisma.client.branchProduct.deleteMany({
            where: { branchId, productId },
        });
    }
}
