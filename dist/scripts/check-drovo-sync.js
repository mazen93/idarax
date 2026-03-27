"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenantId = 'dummy-tenant-123';
    console.log(`--- Idarax Drovo Sync Diagnostic ---`);
    const settings = await prisma.settings.findUnique({
        where: { tenantId }
    });
    if (settings) {
        console.log(`Settings Found:`);
        console.log(`- Drovo Tenant ID: ${settings.drovoTenantId}`);
        console.log(`- Drovo API Key:   ${settings.drovoApiKey ? '*****' : 'MISSING'}`);
        if (settings.drovoTenantId === 'drovo-demo-tenant') {
            console.log('⚠️ WARNING: You are still using "drovo-demo-tenant". Should be "11111111-2222-3333-4444-555555555555"');
        }
    }
    else {
        console.log(`❌ No settings found for tenant ${tenantId}`);
    }
    const latestOrders = await prisma.order.findMany({
        where: { tenantId, orderType: 'DELIVERY' },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(`\nLast 5 DELIVERY Orders:`);
    latestOrders.forEach(o => {
        console.log(`- ID: ${o.id.substring(0, 8)}... Created: ${o.createdAt.toISOString()}`);
        console.log(`  External ID: ${o.externalOrderId} | Platform: ${o.externalPlatform}`);
        console.log(`  Status: ${o.status}`);
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=check-drovo-sync.js.map