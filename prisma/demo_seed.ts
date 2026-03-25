import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Demo Data Seed...');

    // 1. Find the demo user
    const demoUser = await (prisma as any).user.findUnique({
        where: { email: 'demo@restaurant.com' },
    });

    if (!demoUser) {
        console.error('❌ Error: User demo@restaurant.com not found. Please create it first.');
        process.exit(1);
    }

    const tenantId = demoUser.tenantId;
    console.log(`📍 Found Tenant ID: ${tenantId}`);

    // 2. Create a Second Branch
    const newBranch = await (prisma as any).branch.upsert({
        where: { id: 'demo-branch-2' },
        update: {},
        create: {
            id: 'demo-branch-2',
            name: 'Beachside Branch',
            address: 'Ocean Road 42',
            phone: '555-BEACH',
            tenantId,
            isActive: true,
        },
    });
    console.log(`🏢 Created Branch: ${newBranch.name}`);

    // 3. Create a Warehouse for the new branch
    const warehouse = await (prisma as any).warehouse.upsert({
        where: { id: 'demo-warehouse-2' },
        update: {},
        create: {
            id: 'demo-warehouse-2',
            name: 'Beachside Storage',
            tenantId,
            branchId: newBranch.id,
        },
    });
    console.log(`📦 Created Warehouse: ${warehouse.name}`);

    // 4. Create some Staff for the new branch
    const staffPassword = await bcrypt.hash('Staff@123', 12);
    const staffMembers = [
        { name: 'John Beach', email: 'john@beachside.com', role: 'STAFF' },
        { name: 'Sarah Sun', email: 'sarah@beachside.com', role: 'STAFF' },
    ];

    for (const s of staffMembers) {
        await (prisma as any).user.upsert({
            where: { email: s.email },
            update: {},
            create: {
                ...s,
                password: staffPassword,
                tenantId,
                branchId: newBranch.id,
            },
        });
        console.log(`👤 Created Staff: ${s.name}`);
    }

    // 5. Create some Products and Link to Categories
    // First, find or create a category
    const category = await (prisma as any).category.upsert({
        where: { id: 'demo-cat-summer', name_tenantId: { name: 'Summer Specials', tenantId } },
        update: {},
        create: {
            id: 'demo-cat-summer',
            name: 'Summer Specials',
            tenantId,
        },
    });

    const products = [
        { name: 'Tropical Smoothie', price: 15.5, sku: 'TS-001' },
        { name: 'Beach Burger', price: 25.0, sku: 'BB-001' },
        { name: 'Iced Latte', price: 12.0, sku: 'IL-001' },
    ];

    for (const p of products) {
        const product = await (prisma as any).product.upsert({
            where: { sku_tenantId: { sku: p.sku, tenantId } },
            update: {},
            create: {
                ...p,
                tenantId,
                categoryId: category.id,
                productType: 'STANDARD',
            },
        });

        // Add stock to the new warehouse
        await (prisma as any).stockLevel.upsert({
            where: {
                productId_warehouseId: {
                    productId: product.id,
                    warehouseId: warehouse.id
                }
            },
            update: { quantity: 100 },
            create: {
                productId: product.id,
                warehouseId: warehouse.id,
                quantity: 100,
                minThreshold: 10,
            },
        });
        console.log(`🍔 Created Product & Stock: ${p.name}`);
    }

    console.log('✅ Demo data seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
