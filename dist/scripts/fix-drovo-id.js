"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenantId = 'dummy-tenant-123';
    const newDrovoTenantId = '11111111-2222-3333-4444-555555555555';
    console.log(`Updating Idarax settings for tenant ${tenantId}...`);
    const settings = await prisma.settings.update({
        where: { tenantId },
        data: {
            drovoTenantId: newDrovoTenantId,
            drovoApiKey: 'drovo-secret-api-key-123'
        }
    });
    console.log(`✅ Success! Updated Drovo Tenant ID to: ${settings.drovoTenantId}`);
    console.log(`Please create a NEW "DELIVERY" order in POS now.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=fix-drovo-id.js.map