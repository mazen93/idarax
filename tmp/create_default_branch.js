
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenantEmail = 'hookah@email.com';
  console.log(`Creating default branch for tenant: ${tenantEmail}`);

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

  // Check if any branch already exists
  const existingBranches = await prisma.branch.findMany({ where: { tenantId } });
  if (existingBranches.length > 0) {
    console.log('Tenant already has branches.');
    return;
  }

  // 2. Create the Branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Store',
      address: 'Default Address',
      phone: '0000000000',
      tenantId,
      isActive: true,
    },
  });

  // 3. Auto-initialize Catalog (clone master products to branch)
  const products = await prisma.product.findMany({
    where: { tenantId },
    select: { id: true },
  });

  if (products.length > 0) {
    await prisma.branchProduct.createMany({
      data: products.map((p) => ({
        branchId: branch.id,
        productId: p.id,
        isAvailable: true,
      })),
      skipDuplicates: true,
    });
  }

  // 4. Create default Warehouse for this branch
  await prisma.warehouse.create({
    data: {
      name: `Main Warehouse - ${branch.name}`,
      tenantId,
      branchId: branch.id,
    },
  });

  // 5. Create default Kitchen Station
  await prisma.kitchenStation.create({
    data: {
      name: `Main Kitchen - ${branch.name}`,
      tenantId,
      branchId: branch.id,
    },
  });

  // 6. Create default Table Section
  await prisma.tableSection.create({
    data: {
      name: `Main Floor - ${branch.name}`,
      tenantId,
      branchId: branch.id,
    },
  });

  console.log('Default branch and infrastructure created successfully.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
