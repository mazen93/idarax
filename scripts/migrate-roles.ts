import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not found in .env');
    console.log('Checked path:', envPath);
    process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const DEFAULT_ROLES = {
    STAFF: {
        name: 'Cashier',
        description: 'Standard access for handling orders and POS.',
        actions: ['POS:ACCESS', 'ORDERS:VIEW', 'ORDERS:CREATE', 'CUSTOMERS:VIEW', 'KDS:ACCESS']
    },
    MANAGER: {
        name: 'Manager',
        description: 'Full access to managing orders, catalog, and staff.',
        actions: ['POS:ACCESS', 'POS:APPLY_DISCOUNT', 'POS:OVERRIDE_PRICE', 'ORDERS:VIEW', 'ORDERS:CREATE', 'ORDERS:CANCEL', 'ORDERS:REFUND', 'TABLES:VIEW', 'TABLES:MANAGE', 'CUSTOMERS:VIEW', 'CATALOG:VIEW', 'INVENTORY:VIEW', 'REPORTS:VIEW_DAILY', 'STAFF_MANAGEMENT:VIEW', 'CASH_DRAWER:OPEN', 'CASH_DRAWER:CLOSE', 'KDS:ACCESS', 'DASHBOARD:VIEW']
    }
};

async function migrateRoles() {
    console.log('Starting role migration...');
    const tenants = await prisma.tenant.findMany();

    for (const tenant of tenants) {
        console.log(`Migrating tenant: ${tenant.name} (${tenant.id})`);

        // 1. Create Default Custom Roles for the Tenant
        const customRolesMap: Record<string, string> = {};

        for (const [key, data] of Object.entries(DEFAULT_ROLES)) {
            let role = await (prisma as any).role.findFirst({
                where: { name: data.name, tenantId: tenant.id }
            });

            if (!role) {
                role = await (prisma as any).role.create({
                    data: {
                        name: data.name,
                        description: data.description,
                        tenantId: tenant.id,
                        permissions: {
                            create: data.actions.map(action => ({ action, tenantId: tenant.id }))
                        }
                    }
                });
                console.log(`  Created role: ${data.name}`);
            }
            customRolesMap[key] = role.id;
        }

        // 2. Migrate Users to Role IDs
        const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });
        let updatedCount = 0;

        for (const user of users) {
            const u = user as any;
            if (!u.roleId) {
                const mappedRoleKey = (u.role === 'MANAGER' || u.role === 'ADMIN') ? 'MANAGER' : 'STAFF';
                const newRoleId = customRolesMap[mappedRoleKey];

                if (newRoleId) {
                    await (prisma as any).user.update({
                        where: { id: u.id },
                        data: { roleId: newRoleId }
                    });
                    updatedCount++;
                }
            }
        }
        console.log(`  Updated ${updatedCount} users to custom roles.`);
    }

    console.log('Migration completed successfully.');
}

migrateRoles()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
