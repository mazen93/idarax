import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';


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
    const catBreakfast = await prisma.category.upsert({
        where: { name_tenantId: { name: 'Breakfast', tenantId: tenant.id } },
        update: {},
        create: { name: 'Breakfast', nameAr: 'فطور', tenantId: tenant.id }
    });
    const catMain = await prisma.category.upsert({
        where: { name_tenantId: { name: 'Main Courses', tenantId: tenant.id } },
        update: {},
        create: { name: 'Main Courses', nameAr: 'الأطباق الرئيسية', tenantId: tenant.id }
    });
    const catDrinks = await prisma.category.upsert({
        where: { name_tenantId: { name: 'Drinks', tenantId: tenant.id } },
        update: {},
        create: { name: 'Drinks', nameAr: 'مشروبات', tenantId: tenant.id }
    });

    // 5. Create Products
    const p1 = await prisma.product.upsert({
        where: { sku_tenantId: { sku: 'BK-01', tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Classic Pancakes',
            nameAr: 'بانكيك كلاسيك',
            price: 15.00,
            categoryId: catBreakfast.id,
            tenantId: tenant.id,
            sku: 'BK-01',
        }
    });

    const p2 = await prisma.product.upsert({
        where: { sku_tenantId: { sku: 'MN-01', tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Beef Burger',
            nameAr: 'برجر لحم',
            price: 25.00,
            categoryId: catMain.id,
            tenantId: tenant.id,
            sku: 'MN-01',
        }
    });

    const p3 = await prisma.product.upsert({
        where: { sku_tenantId: { sku: 'DR-01', tenantId: tenant.id } },
        update: {},
        create: {
            name: 'Fresh Orange Juice',
            nameAr: 'عصير برتقال طازج',
            price: 10.00,
            categoryId: catDrinks.id,
            tenantId: tenant.id,
            sku: 'DR-01',
        }
    });

    // 6. Create Tables
    await prisma.table.upsert({
        where: { number_tenantId_branchId: { number: 1, tenantId: tenant.id, branchId: branch.id } },
        update: {},
        create: { number: 1, capacity: 4, tenantId: tenant.id, branchId: branch.id, status: 'AVAILABLE' }
    });
    await prisma.table.upsert({
        where: { number_tenantId_branchId: { number: 2, tenantId: tenant.id, branchId: branch.id } },
        update: {},
        create: { number: 2, capacity: 2, tenantId: tenant.id, branchId: branch.id, status: 'AVAILABLE' }
    });

    // 7. Create Menus
    await prisma.menu.upsert({
        where: { id: 'breakfast-menu-id' },
        update: {},
        create: {
            id: 'breakfast-menu-id',
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

    await prisma.menu.upsert({
        where: { id: 'allday-menu-id' },
        update: {},
        create: {
            id: 'allday-menu-id',
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
    const customer = await prisma.customer.upsert({
        where: { phone: '1234567890' },
        update: {},
        create: {
            name: 'John Doe',
            phone: '1234567890',
            tenantId: tenant.id,
        }
    });

    // 9. Create Settings
    await prisma.settings.upsert({
        where: { tenantId: tenant.id },
        update: {
            currency: 'USD',
            taxRate: 15,
            serviceFee: 5,
        },
        create: {
            tenantId: tenant.id,
            currency: 'USD',
            taxRate: 15,
            serviceFee: 5,
        }
    });

    // 10. Create Subscription Plans
    const plans = [
        {
            name: 'Starter',
            price: 29.99,
            maxPos: 1,
            maxKds: 0,
            maxBranches: 1,
            maxUsers: 5,
            features: ['BASIC_ANALYTICS', 'STANDARD_POS'],
        },
        {
            name: 'Pro',
            price: 79.99,
            maxPos: 3,
            maxKds: 2,
            maxBranches: 3,
            maxUsers: 20,
            features: ['BASIC_ANALYTICS', 'ADVANCED_ANALYTICS', 'STANDARD_POS', 'TABLES', 'CRM', 'INVENTORY', 'RESTAURANT'],
        },
        {
            name: 'Enterprise',
            price: 199.99,
            maxPos: 10,
            maxKds: 10,
            maxBranches: 10,
            maxUsers: 100,
            features: [
                'BASIC_ANALYTICS', 'ADVANCED_ANALYTICS', 'STANDARD_POS', 'TABLES', 'CRM', 'INVENTORY', 'MARKETING', 'KDS', 'KDS_ANALYTICS', 'RESTAURANT',
                'WIN_BACK_MARKETING', 'WHITE_LABELING', 'OFFLINE_RESILIENCE'
            ],
        }
    ];

    for (const plan of plans) {
        await (prisma.subscriptionPlan as any).upsert({
            where: { name: plan.name },
            update: plan,
            create: plan,
        });
    }

    // 11. Create Hookah Tenant (the one the user is testing with)
    const starterPlan = await (prisma.subscriptionPlan as any).findUnique({ where: { name: 'Starter' } });
    
    const hookahTenant = await prisma.tenant.upsert({
        where: { id: 'cc763a27-9979-4d02-867b-aff582c33d8e' },
        update: {
            planId: starterPlan?.id,
            maxBranches: (starterPlan as any)?.maxBranches || 1,
            maxPos: starterPlan?.maxPos || 1,
            maxKds: starterPlan?.maxKds || 0,
        },
        create: {
            id: 'cc763a27-9979-4d02-867b-aff582c33d8e',
            name: 'Hookah Cafe',
            type: 'CAFE',
            planId: starterPlan?.id,
            maxBranches: (starterPlan as any)?.maxBranches || 1,
            maxPos: starterPlan?.maxPos || 1,
            maxKds: starterPlan?.maxKds || 0,
        }
    });

    const hookahPass = await bcrypt.hash('Aa123123$', 10);
    await prisma.user.upsert({
        where: { email: 'hookah@email.com' },
        update: {},
        create: {
            email: 'hookah@email.com',
            password: hookahPass,
            name: 'Hookah Admin',
            role: 'ADMIN',
            tenantId: hookahTenant.id,
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
