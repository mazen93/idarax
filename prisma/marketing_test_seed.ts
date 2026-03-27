import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenantId = 'dummy-tenant-123';
    console.log(`🌱 Seeding inactive customers for tenant ${tenantId}...`);

    // 1. Create an inactive customer (last order 40 days ago)
    const inactiveCustomer = await prisma.customer.upsert({
        where: { phone: '9999999999' },
        update: {},
        create: {
            name: 'Inactive Bob',
            email: 'bob@example.com',
            phone: '9999999999',
            tenantId: tenantId,
        }
    });

    const fortyDaysAgo = new Date();
    fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

    // Using a raw query or ensuring the model is correct
    await (prisma as any).order.create({
        data: {
            totalAmount: 50.00,
            tenantId: tenantId,
            customerId: inactiveCustomer.id,
            createdAt: fortyDaysAgo,
            status: 'COMPLETED',
        }
    });

    // 2. Create an active customer (order 2 days ago)
    const activeCustomer = await prisma.customer.upsert({
        where: { phone: '8888888888' },
        update: {},
        create: {
            name: 'Active Alice',
            email: 'alice@example.com',
            phone: '8888888888',
            tenantId: tenantId,
        }
    });

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await (prisma as any).order.create({
        data: {
            totalAmount: 30.00,
            tenantId: tenantId,
            customerId: activeCustomer.id,
            createdAt: twoDaysAgo,
            status: 'COMPLETED',
        }
    });

    console.log('✅ Done! Inactive Bob should now be a candidate for Win-Back.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
