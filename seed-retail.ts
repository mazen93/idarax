import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding retail dummy data...');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const tenant = await prisma.tenant.create({
        data: {
            name: 'Dummy Retail Store',
            type: 'RETAIL',
            slug: 'dummy-retail-' + Date.now(),
            status: 'ACTIVE',
            isActive: true
        }
    });

    const user = await prisma.user.create({
        data: {
            name: 'Retail Admin',
            email: 'retail' + Date.now() + '@idarax.com',
            password,
            role: 'ADMIN',
            tenantId: tenant.id
        }
    });

    const branch = await prisma.branch.create({
        data: {
            name: 'Main Branch',
            tenantId: tenant.id,
            isActive: true
        }
    });

    const warehouse = await prisma.warehouse.create({
        data: {
            name: 'Central Warehouse',
            location: 'Downtown',
            tenantId: tenant.id,
            branchId: branch.id
        }
    });

    const category = await prisma.category.create({
        data: {
            name: 'General Merchandise',
            tenantId: tenant.id
        }
    });

    const p1 = await prisma.product.create({
        data: {
            name: 'Cotton T-Shirt',
            price: 25.00,
            costPrice: 10.00,
            sku: 'TSHIRT-01',
            barcode: '123456789012',
            tenantId: tenant.id,
            categoryId: category.id,
            productType: 'STANDARD'
        }
    });

    const p2 = await prisma.product.create({
        data: {
            name: 'Coffee Mug',
            price: 15.00,
            costPrice: 5.00,
            sku: 'MUG-01',
            barcode: '987654321098',
            tenantId: tenant.id,
            categoryId: category.id,
            productType: 'STANDARD'
        }
    });

    const p3 = await prisma.product.create({
        data: {
            name: 'Wireless Mouse',
            price: 45.00,
            costPrice: 20.00,
            sku: 'MOUSE-01',
            barcode: '555555555555',
            tenantId: tenant.id,
            categoryId: category.id,
            productType: 'STANDARD'
        }
    });

    // Add stock levels
    await prisma.stockLevel.createMany({
        data: [
            { productId: p1.id, warehouseId: warehouse.id, quantity: 150 },
            { productId: p2.id, warehouseId: warehouse.id, quantity: 45 },
            { productId: p3.id, warehouseId: warehouse.id, quantity: 20 },
        ]
    });

    console.log('Seeding complete! You can log in with:');
    console.log('Email:', user.email);
    console.log('Password: 123456');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
