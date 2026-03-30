
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'hookah@email.com' },
    include: { tenant: { include: { plan: true } } }
  });
  console.log(JSON.stringify(user, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
