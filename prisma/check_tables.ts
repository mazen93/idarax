import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    .finally(() => pool.end());
