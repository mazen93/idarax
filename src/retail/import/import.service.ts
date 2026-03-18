import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import * as XLSX from 'xlsx';
import { ProductType } from '@prisma/client';

export interface ImportResults {
    imported: number;
    updated: number;
    skipped: number;
    errors: string[];
}

@Injectable()
export class ImportService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async importProducts(file: Express.Multer.File, mode: 'OVERRIDE' | 'SKIP_EXISTING' = 'SKIP_EXISTING'): Promise<ImportResults> {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new BadRequestException('Invalid Excel/CSV file');
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!rows.length) throw new BadRequestException('Empty file');

        const results: ImportResults = { imported: 0, updated: 0, skipped: 0, errors: [] };

        // Process in a transaction to ensure data integrity
        await this.prisma.$transaction(async (tx: any) => {
            // Group rows by Product Handle/SKU
            const productsMap = new Map<string, any[]>();
            for (const row of rows as any[]) {
                const handle = row.Handle || row.SKU || row.Name;
                if (!handle) continue;
                if (!productsMap.has(handle)) productsMap.set(handle, []);
                productsMap.get(handle)!.push(row);
            }

            for (const [handle, productRows] of productsMap.entries()) {
                try {
                    const primaryRow = productRows.find(r => r.Type === 'PRODUCT') || productRows[0];
                    const sku = primaryRow.SKU?.toString().trim();
                    const name = primaryRow.Name?.toString().trim();

                    if (!name) {
                        results.errors.push(`Row missing Name: ${JSON.stringify(primaryRow)}`);
                        continue;
                    }

                    // 1. Find or Create Category
                    let categoryId = null;
                    if (primaryRow.Category) {
                        const cat = await tx.category.upsert({
                            where: { name_tenantId: { name: primaryRow.Category.trim(), tenantId } },
                            create: { name: primaryRow.Category.trim(), tenantId },
                            update: {},
                        });
                        categoryId = cat.id;
                    } else {
                        // Default category if none provided
                        const defaultCat = await tx.category.findFirst({ where: { tenantId } });
                        categoryId = defaultCat?.id;
                        if (!categoryId) {
                            const newCat = await tx.category.create({ data: { name: 'Uncategorized', tenantId } });
                            categoryId = newCat.id;
                        }
                    }

                    // 2. Check existence
                    let existingProduct = null;
                    if (sku) {
                        existingProduct = await tx.product.findUnique({
                            where: { sku_tenantId: { sku, tenantId } },
                        });
                    } else {
                        existingProduct = await tx.product.findFirst({
                            where: { name, tenantId },
                        });
                    }

                    if (existingProduct && mode === 'SKIP_EXISTING') {
                        results.skipped++;
                        continue;
                    }

                    const productData = {
                        name,
                        nameAr: primaryRow.NameAr || null,
                        description: primaryRow.Description || null,
                        price: parseFloat(primaryRow.Price || 0),
                        costPrice: parseFloat(primaryRow.CostPrice || 0),
                        sku: sku || null,
                        barcode: primaryRow.Barcode?.toString() || null,
                        categoryId,
                        tenantId,
                        productType: (primaryRow.Type === 'COMBO' ? 'COMBO' : 'STANDARD') as ProductType,
                    };

                    let productId;
                    if (existingProduct) {
                        // Override existing
                        productId = existingProduct.id;
                        await tx.product.update({
                            where: { id: productId },
                            data: productData,
                        });
                        // Clear children for full override
                        await tx.variant.deleteMany({ where: { productId } });
                        await tx.productModifier.deleteMany({ where: { productId } });
                        await tx.productRecipe.deleteMany({ where: { parentId: productId } });
                        results.updated++;
                    } else {
                        const newProduct = await tx.product.create({ data: productData });
                        productId = newProduct.id;
                        results.imported++;
                    }

                    // 3. Process Variants, Modifiers, Combo Items
                    for (const row of productRows) {
                        if (row.Type === 'VARIANT' && row.Name) {
                            await tx.variant.create({
                                data: {
                                    productId,
                                    name: row.Name,
                                    price: row.Price ? parseFloat(row.Price) : productData.price,
                                    costPrice: row.CostPrice ? parseFloat(row.CostPrice) : productData.costPrice,
                                    sku: row.SKU?.toString() || null,
                                },
                            });
                        } else if (row.Type === 'MODIFIER' && row.Name) {
                            const mod = await tx.productModifier.create({
                                data: {
                                    productId,
                                    name: row.Name,
                                    nameAr: row.NameAr || null,
                                    required: row.Required?.toString().toLowerCase() === 'true',
                                    multiSelect: row.MultiSelect?.toString().toLowerCase() === 'true',
                                },
                            });

                            if (row.ModifierOptions) {
                                const options = row.ModifierOptions.split(';').map((opt: string) => {
                                    const [optName, priceAdj] = opt.split(':');
                                    return {
                                        modifierId: mod.id,
                                        name: optName.trim(),
                                        priceAdjust: parseFloat(priceAdj || '0'),
                                    };
                                });
                                await tx.productModifierOption.createMany({ data: options });
                            }
                        }
                    }

                    // 4. Handle Combo Content (if COMBO_ITEM rows exist)
                    const comboItems = productRows.filter(r => r.Type === 'COMBO_ITEM');
                    if (comboItems.length) {
                        for (const item of comboItems) {
                            // Find ingredient by SKU or Name
                            const ingredient = await tx.product.findFirst({
                                where: {
                                    OR: [
                                        { sku: item.IngredientSKU?.toString() },
                                        { name: item.IngredientName?.toString() }
                                    ],
                                    tenantId
                                }
                            });
                            if (ingredient) {
                                await tx.productRecipe.create({
                                    data: {
                                        parentId: productId,
                                        ingredientId: ingredient.id,
                                        quantity: parseFloat(item.Quantity || 1),
                                        unit: item.Unit || 'unit',
                                    }
                                });
                            }
                        }
                    }

                } catch (err) {
                    results.errors.push(`Error processing ${handle}: ${err.message}`);
                }
            }
        });

        return results;
    }

    async importCustomers(file: Express.Multer.File, mode: 'OVERRIDE' | 'SKIP_EXISTING' = 'SKIP_EXISTING'): Promise<ImportResults> {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new BadRequestException('Invalid Excel/CSV file');
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!rows.length) throw new BadRequestException('Empty file');

        const results: ImportResults = { imported: 0, updated: 0, skipped: 0, errors: [] };

        await this.prisma.$transaction(async (tx: any) => {
            // Group rows by Phone
            const customersMap = new Map<string, any[]>();
            for (const row of rows as any[]) {
                const phone = row.Phone?.toString().trim();
                if (!phone) {
                    results.errors.push(`Row missing Phone number: ${JSON.stringify(row)}`);
                    continue;
                }
                if (!customersMap.has(phone)) customersMap.set(phone, []);
                customersMap.get(phone)!.push(row);
            }

            for (const [phone, customerRows] of customersMap.entries()) {
                try {
                    const primaryRow = customerRows[0];
                    const name = primaryRow.Name?.toString().trim();

                    if (!name) {
                        results.errors.push(`Customer with phone ${phone} missing Name.`);
                        continue;
                    }

                    // Check existence
                    let existingCustomer = await tx.customer.findUnique({
                        where: { phone },
                    });

                    if (existingCustomer && existingCustomer.tenantId !== tenantId) {
                        results.errors.push(`Phone ${phone} belongs to another tenant.`);
                        continue;
                    }

                    if (existingCustomer && mode === 'SKIP_EXISTING') {
                        results.skipped++;
                        continue;
                    }

                    const customerData = {
                        name,
                        email: primaryRow.Email?.toString().trim() || null,
                        phone,
                        points: parseInt(primaryRow.Points?.toString() || '0'),
                        tenantId,
                    };

                    let customerId;
                    if (existingCustomer) {
                        customerId = existingCustomer.id;
                        await tx.customer.update({
                            where: { id: customerId },
                            data: customerData,
                        });
                        // Clear addresses for full override
                        await tx.customerAddress.deleteMany({ where: { customerId } });
                        results.updated++;
                    } else {
                        const newCustomer = await tx.customer.create({ data: customerData });
                        customerId = newCustomer.id;
                        results.imported++;
                    }

                    // Process Addresses
                    for (const row of customerRows) {
                        if (row.Address) {
                            await tx.customerAddress.create({
                                data: {
                                    customerId,
                                    label: row.AddressLabel?.toString().trim() || 'Home',
                                    address: row.Address.toString().trim(),
                                    isDefault: row.IsDefault?.toString().toLowerCase() === 'true',
                                },
                            });
                        }
                    }

                } catch (err) {
                    results.errors.push(`Error processing customer ${phone}: ${err.message}`);
                }
            }
        });

        return results;
    }
}
