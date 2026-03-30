
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenantEmail = 'hookah@email.com';
  console.log(`Fixing tenant: ${tenantEmail}`);

  // 1. Find the user and tenant
  const user = await prisma.user.findFirst({
    where: { email: tenantEmail },
    include: { tenant: true }
  });

  if (!user || !user.tenant) {
    console.error('User or Tenant not found');
    return;
  }

  const tenantId = user.tenantId;
  const planId = 'plan-enterprise';

  // 2. Ensure the Enterprise plan exists and has ADVANCED_ANALYTICS feature
  const enterprisePlan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (enterprisePlan) {
    const currentFeatures = enterprisePlan.features || [];
    if (!currentFeatures.includes('ADVANCED_ANALYTICS')) {
      console.log('Adding ADVANCED_ANALYTICS to Enterprise plan features');
      await prisma.subscriptionPlan.update({
        where: { id: planId },
        data: {
          features: {
            push: 'ADVANCED_ANALYTICS'
          }
        }
      });
    }
  }

  // 3. Update the tenant record limits and ensure planId is set
  console.log('Updating tenant limits and features override');
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      planId: planId,
      maxBranches: 10,
      maxPos: 10,
      maxKds: 10,
      maxUsers: 100,
      hasDeliveryIntegration: true // Enterprise should have this
    }
  });

  console.log('Fix completed successfully.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
