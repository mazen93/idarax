import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Use a plain PrismaClient for seeding to bypass tenant injection requirements
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial data...');

    // 1. Create Tenant
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

    // 2. Create Branch
    const branch = await prisma.branch.upsert({
        where: { name_tenantId: { name: 'Main Branch', tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Main Branch',
            tenantId: tenant.id,
            isActive: true,
        },
    });

    // 3. Create User (Admin)
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@idarax.com' },
        update: {},
        create: {
            email: 'admin@idarax.com',
            password: adminPassword,
            name: 'Demo Admin',
            role: 'ADMIN' as any,
            tenantId: tenant.id,
            branchId: branch.id,
            pinCode: '1234',
        },
    });

    // 4. Create Categories
    const catBreakfast = await prisma.category.create({
        data: { name: 'Breakfast', nameAr: 'فطور', tenantId: tenant.id }
    });
    const catMain = await prisma.category.create({
        data: { name: 'Main Courses', nameAr: 'الأطباق الرئيسية', tenantId: tenant.id }
    });
    const catDrinks = await prisma.category.create({
        data: { name: 'Drinks', nameAr: 'مشروبات', tenantId: tenant.id }
    });

    // 5. Create Products
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

    // 6. Create Tables
    await prisma.table.create({
        data: { number: 1, capacity: 4, tenantId: tenant.id, branchId: branch.id, status: 'AVAILABLE' }
    });
    await prisma.table.create({
        data: { number: 2, capacity: 2, tenantId: tenant.id, branchId: branch.id, status: 'AVAILABLE' }
    });

    // 7. Create Menus
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

    // 8. Create Customer
    const customer = await prisma.customer.create({
        data: {
            name: 'John Doe',
            phone: '1234567890',
            tenantId: tenant.id,
        }
    });

    // 9. Create Settings
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
