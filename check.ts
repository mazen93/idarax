import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const tenant = await prisma.tenant.findFirst({ orderBy: { createdAt: 'desc' } });
    console.log("Tenant:", tenant?.name, "isActive:", tenant?.isActive, "status:", tenant?.status);
    const user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    console.log("User:", user?.email, "tenantId:", user?.tenantId);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
