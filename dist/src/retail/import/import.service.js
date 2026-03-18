"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
const XLSX = __importStar(require("xlsx"));
let ImportService = class ImportService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async importProducts(file, mode = 'SKIP_EXISTING') {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName)
            throw new common_1.BadRequestException('Invalid Excel/CSV file');
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (!rows.length)
            throw new common_1.BadRequestException('Empty file');
        const results = { imported: 0, updated: 0, skipped: 0, errors: [] };
        await this.prisma.$transaction(async (tx) => {
            const productsMap = new Map();
            for (const row of rows) {
                const handle = row.Handle || row.SKU || row.Name;
                if (!handle)
                    continue;
                if (!productsMap.has(handle))
                    productsMap.set(handle, []);
                productsMap.get(handle).push(row);
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
                    let categoryId = null;
                    if (primaryRow.Category) {
                        const cat = await tx.category.upsert({
                            where: { name_tenantId: { name: primaryRow.Category.trim(), tenantId } },
                            create: { name: primaryRow.Category.trim(), tenantId },
                            update: {},
                        });
                        categoryId = cat.id;
                    }
                    else {
                        const defaultCat = await tx.category.findFirst({ where: { tenantId } });
                        categoryId = defaultCat?.id;
                        if (!categoryId) {
                            const newCat = await tx.category.create({ data: { name: 'Uncategorized', tenantId } });
                            categoryId = newCat.id;
                        }
                    }
                    let existingProduct = null;
                    if (sku) {
                        existingProduct = await tx.product.findUnique({
                            where: { sku_tenantId: { sku, tenantId } },
                        });
                    }
                    else {
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
                        productType: (primaryRow.Type === 'COMBO' ? 'COMBO' : 'STANDARD'),
                    };
                    let productId;
                    if (existingProduct) {
                        productId = existingProduct.id;
                        await tx.product.update({
                            where: { id: productId },
                            data: productData,
                        });
                        await tx.variant.deleteMany({ where: { productId } });
                        await tx.productModifier.deleteMany({ where: { productId } });
                        await tx.productRecipe.deleteMany({ where: { parentId: productId } });
                        results.updated++;
                    }
                    else {
                        const newProduct = await tx.product.create({ data: productData });
                        productId = newProduct.id;
                        results.imported++;
                    }
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
                        }
                        else if (row.Type === 'MODIFIER' && row.Name) {
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
                                const options = row.ModifierOptions.split(';').map((opt) => {
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
                    const comboItems = productRows.filter(r => r.Type === 'COMBO_ITEM');
                    if (comboItems.length) {
                        for (const item of comboItems) {
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
                }
                catch (err) {
                    results.errors.push(`Error processing ${handle}: ${err.message}`);
                }
            }
        });
        return results;
    }
    async importCustomers(file, mode = 'SKIP_EXISTING') {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName)
            throw new common_1.BadRequestException('Invalid Excel/CSV file');
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (!rows.length)
            throw new common_1.BadRequestException('Empty file');
        const results = { imported: 0, updated: 0, skipped: 0, errors: [] };
        await this.prisma.$transaction(async (tx) => {
            const customersMap = new Map();
            for (const row of rows) {
                const phone = row.Phone?.toString().trim();
                if (!phone) {
                    results.errors.push(`Row missing Phone number: ${JSON.stringify(row)}`);
                    continue;
                }
                if (!customersMap.has(phone))
                    customersMap.set(phone, []);
                customersMap.get(phone).push(row);
            }
            for (const [phone, customerRows] of customersMap.entries()) {
                try {
                    const primaryRow = customerRows[0];
                    const name = primaryRow.Name?.toString().trim();
                    if (!name) {
                        results.errors.push(`Customer with phone ${phone} missing Name.`);
                        continue;
                    }
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
                        await tx.customerAddress.deleteMany({ where: { customerId } });
                        results.updated++;
                    }
                    else {
                        const newCustomer = await tx.customer.create({ data: customerData });
                        customerId = newCustomer.id;
                        results.imported++;
                    }
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
                }
                catch (err) {
                    results.errors.push(`Error processing customer ${phone}: ${err.message}`);
                }
            }
        });
        return results;
    }
};
exports.ImportService = ImportService;
exports.ImportService = ImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], ImportService);
//# sourceMappingURL=import.service.js.map