import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  const email = 'admin@idarax.io';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // A SUPER_ADMIN technically needs a tenant. We will create a "system" tenant for them.
    let systemTenant = await prisma.tenant.findFirst({
        where: { name: 'System Root Tenant' }
    });

    if (!systemTenant) {
        systemTenant = await prisma.tenant.create({
            data: {
                name: 'System Root Tenant',
                type: 'RESTAURANT'
            }
        });
    }

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        tenantId: systemTenant.id,
      },
      create: {
        email,
        password: hashedPassword,
        name: 'System Admin',
        role: 'SUPER_ADMIN',
        tenantId: systemTenant.id,
      },
    });

    console.log(`Created Super Admin: ${admin.email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Failed to create super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
