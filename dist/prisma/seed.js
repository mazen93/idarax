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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding initial data...');
    const tenant = await prisma.tenant.upsert({
        where: { id: 'test-tenant-id' },
        update: {},
        create: {
            id: 'test-tenant-id',
            name: 'Idarax Demo Restaurant',
            type: 'RETAIL',
            domain: 'demo.idarax.com',
        },
    });
    const branch = await prisma.branch.upsert({
        where: { name_tenantId: { name: 'Main Branch', tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Main Branch',
            tenantId: tenant.id,
            isActive: true,
        },
    });
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@idarax.com' },
        update: {},
        create: {
            email: 'admin@idarax.com',
            password: adminPassword,
            name: 'Demo Admin',
            role: 'ADMIN',
            tenantId: tenant.id,
            branchId: branch.id,
            pinCode: '1234',
        },
    });
    const catBreakfast = await prisma.category.create({
        data: { name: 'Breakfast', nameAr: 'فطور', tenantId: tenant.id }
    });
    const catMain = await prisma.category.create({
        data: { name: 'Main Courses', nameAr: 'الأطباق الرئيسية', tenantId: tenant.id }
    });
    const catDrinks = await prisma.category.create({
        data: { name: 'Drinks', nameAr: 'مشروبات', tenantId: tenant.id }
    });
    const p1 = await prisma.product.create({
        data: {
            name: 'Classic Pancakes',
            nameAr: 'بانكيك كلاسيك',
            price: 15.00,
            categoryId: catBreakfast.id,
            tenantId: tenant.id,
            sku: 'BK-01',
        }
    });
    const p2 = await prisma.product.create({
        data: {
            name: 'Beef Burger',
            nameAr: 'برجر لحم',
            price: 25.00,
            categoryId: catMain.id,
            tenantId: tenant.id,
            sku: 'MN-01',
        }
    });
    const p3 = await prisma.product.create({
        data: {
            name: 'Fresh Orange Juice',
            nameAr: 'عصير برتقال طازج',
            price: 10.00,
            categoryId: catDrinks.id,
            tenantId: tenant.id,
            sku: 'DR-01',
        }
    });
    await prisma.table.create({
        data: { number: 1, capacity: 4, tenantId: tenant.id, branchId: branch.id, status: 'AVAILABLE' }
    });
    await prisma.table.create({
        data: { number: 2, capacity: 2, tenantId: tenant.id, branchId: branch.id, status: 'AVAILABLE' }
    });
    const breakfastMenu = await prisma.menu.create({
        data: {
            name: 'Breakfast Menu',
            nameAr: 'قائمة الفطور',
            startTime: '06:00',
            endTime: '12:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            tenantId: tenant.id,
            branchId: branch.id,
            categories: {
                create: [
                    { categoryId: catBreakfast.id },
                    { categoryId: catDrinks.id }
                ]
            }
        }
    });
    const allDayMenu = await prisma.menu.create({
        data: {
            name: 'All Day Menu',
            nameAr: 'قائمة طوال اليوم',
            startTime: '12:01',
            endTime: '23:59',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            tenantId: tenant.id,
            branchId: branch.id,
            categories: {
                create: [
                    { categoryId: catMain.id },
                    { categoryId: catDrinks.id }
                ]
            }
        }
    });
    const customer = await prisma.customer.create({
        data: {
            name: 'John Doe',
            phone: '1234567890',
            tenantId: tenant.id,
        }
    });
    await prisma.settings.create({
        data: {
            tenantId: tenant.id,
            currency: 'USD',
            taxRate: 15,
            serviceFee: 5,
        }
    });
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map