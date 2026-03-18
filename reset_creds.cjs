const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://idarax_user:idarax_password@localhost:5433/idarax_db?schema=public'
        }
    }
});

async function main() {
    const hash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.update({
        where: { email: 'admin@gmail.com' },
        data: { password: hash }
    });
    console.log('Admin password reset successful:', user.email);

    const hassan = await prisma.user.findFirst({ where: { name: { contains: 'Ahmed' } } });
    if (hassan) {
        await prisma.user.update({
            where: { id: hassan.id },
            data: { pinCode: '123456' }
        });
        console.log('Staff PIN reset successful:', hassan.name);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
