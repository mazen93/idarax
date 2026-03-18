import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating dummy tenant...');

    // 1. Create dummy tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: 'dummy-tenant-123' },
        update: {},
        create: {
            id: 'dummy-tenant-123',
            name: 'Demo Restaurant',
            type: 'RESTAURANT',
        },
    });

    // 2. Create dummy admin user for the tenant
    const hashedPassword = await bcrypt.hash('Demo@12345', 10);
    await (prisma as any).user.upsert({
        where: { email: 'demo@restaurant.com' },
        update: { pinCode: '123123' },
        create: {
            email: 'demo@restaurant.com',
            password: hashedPassword,
            firstName: 'Demo',
            lastName: 'Admin',
            role: 'ADMIN',
            tenantId: tenant.id,
            pinCode: '123123',
        },
    });

    console.log('✅ Dummy tenant created!');
    console.log(`   Tenant ID: dummy-tenant-123`);
    console.log(`   Email:     demo@restaurant.com`);
    console.log(`   Password:  Demo@12345`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
