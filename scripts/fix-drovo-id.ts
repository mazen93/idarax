import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const tenantId = 'dummy-tenant-123';
    const newDrovoTenantId = '11111111-2222-3333-4444-555555555555';
    
    console.log(`Updating Idarax settings for tenant ${tenantId}...`);
    
    const settings = await prisma.settings.update({
        where: { tenantId },
        data: {
            drovoTenantId: newDrovoTenantId,
            drovoApiKey: 'drovo-secret-api-key-123' // Ensuring it matches my setup script
        }
    });

    console.log(`✅ Success! Updated Drovo Tenant ID to: ${settings.drovoTenantId}`);
    console.log(`Please create a NEW "DELIVERY" order in POS now.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
