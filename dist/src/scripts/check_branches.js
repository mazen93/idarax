"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const tenant = await prisma.tenant.findFirst({
        where: { OR: [{ id: 'dummy-tenant-123' }, { name: 'dummy-tenant-123' }] },
        include: { branches: true }
    });
    if (!tenant) {
        console.log('Tenant not found');
        return;
    }
    console.log(`Tenant: ${tenant.name} (${tenant.id})`);
    console.log('Branches:');
    tenant.branches.forEach(b => console.log(` - ${b.name} (${b.id})`));
    const branches = tenant.branches;
    for (const branch of branches) {
        const productsInBranch = await prisma.branchProduct.count({
            where: { branchId: branch.id, isAvailable: true }
        });
        console.log(`Branch ${branch.name} has ${productsInBranch} available products in BranchProduct table.`);
    }
    const allProducts = await prisma.product.count({
        where: { tenantId: tenant.id }
    });
    console.log(`Total products for tenant: ${allProducts}`);
    const categories = await prisma.category.findMany({
        where: { tenantId: tenant.id },
        include: { _count: { select: { products: true } } }
    });
    console.log('Categories:');
    categories.forEach(c => console.log(` - ${c.name}: ${c._count.products} products`));
    process.exit(0);
}
run();
//# sourceMappingURL=check_branches.js.map