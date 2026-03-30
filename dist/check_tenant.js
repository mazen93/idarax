"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'hookah@email.com' },
        include: {
            tenant: {
                include: {
                    plan: true,
                },
            },
        },
    });
    if (!user) {
        console.log('User not found');
        return;
    }
    console.log(JSON.stringify({
        userId: user.id,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name,
        planName: user.tenant?.plan?.name,
        features: user.tenant?.plan?.features,
        expiryDate: user.tenant?.subscriptionExpiresAt,
        maxPos: user.tenant?.maxPos,
        maxKds: user.tenant?.maxKds,
        planMaxPos: user.tenant?.plan?.maxPos,
        planMaxKds: user.tenant?.plan?.maxKds,
    }, null, 2));
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check_tenant.js.map