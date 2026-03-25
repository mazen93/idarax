import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function checkData() {
    console.log('--- TABLES ---');
    const tables = await (prisma as any).table.findMany({
        select: { id: true, number: true, tenantId: true, branchId: true, sectionId: true }
    });
    console.log('TABLES_RESULT:', JSON.stringify(tables));

    console.log('--- SECTIONS ---');
    const sections = await (prisma as any).tableSection.findMany({
        select: { id: true, name: true, tenantId: true, branchId: true }
    });
    console.log('SECTIONS_RESULT:', JSON.stringify(sections));

    await prisma.$disconnect();
}

checkData()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
