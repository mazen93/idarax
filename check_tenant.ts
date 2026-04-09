import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    status: user.tenant?.status,
    isActive: user.tenant?.isActive,
    planName: user.tenant?.plan?.name,
    features: user.tenant?.plan?.features,
    expiryDate: user.tenant?.subscriptionExpiresAt,
  }, null, 2));

  const requests = await prisma.upgradeRequest.findMany({
    where: { tenantId: user.tenantId, status: 'PENDING' },
    include: { toPlan: true }
  });

  console.log('--- Pending Upgrade Requests ---');
  console.log(JSON.stringify(requests, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
