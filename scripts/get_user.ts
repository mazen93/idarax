import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const user = await prisma.user.findFirst();
    console.log('User email:', user?.email);
    console.log('User password hash:', user?.password);
}

run().finally(() => prisma.$disconnect());
