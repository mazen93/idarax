import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Activating all pending tenants...');

    await prisma.tenant.updateMany({
        where: { isActive: false },
        data: {
            isActive: true,
            status: 'ACTIVE'
        }
    });

    console.log('Done! All accounts are now fully active.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
