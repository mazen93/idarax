"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });
if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL not found in .env');
    console.log('Checked path:', envPath);
    process.exit(1);
}
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
        const customRolesMap = {};
        for (const [key, data] of Object.entries(DEFAULT_ROLES)) {
            let role = await prisma.role.findFirst({
                where: { name: data.name, tenantId: tenant.id }
            });
            if (!role) {
                role = await prisma.role.create({
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
        const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });
        let updatedCount = 0;
        for (const user of users) {
            const u = user;
            if (!u.roleId) {
                const mappedRoleKey = (u.role === 'MANAGER' || u.role === 'ADMIN') ? 'MANAGER' : 'STAFF';
                const newRoleId = customRolesMap[mappedRoleKey];
                if (newRoleId) {
                    await prisma.user.update({
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
//# sourceMappingURL=migrate-roles.js.map