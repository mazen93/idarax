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
const bcrypt = __importStar(require("bcryptjs"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🚀 Starting Demo Data Seed...');
    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@restaurant.com' },
    });
    if (!demoUser) {
        console.error('❌ Error: User demo@restaurant.com not found. Please create it first.');
        process.exit(1);
    }
    const tenantId = demoUser.tenantId;
    console.log(`📍 Found Tenant ID: ${tenantId}`);
    const newBranch = await prisma.branch.upsert({
        where: { id: 'demo-branch-2' },
        update: {},
        create: {
            id: 'demo-branch-2',
            name: 'Beachside Branch',
            address: 'Ocean Road 42',
            phone: '555-BEACH',
            tenantId,
            isActive: true,
        },
    });
    console.log(`🏢 Created Branch: ${newBranch.name}`);
    const warehouse = await prisma.warehouse.upsert({
        where: { id: 'demo-warehouse-2' },
        update: {},
        create: {
            id: 'demo-warehouse-2',
            name: 'Beachside Storage',
            tenantId,
            branchId: newBranch.id,
        },
    });
    console.log(`📦 Created Warehouse: ${warehouse.name}`);
    const staffPassword = await bcrypt.hash('Staff@123', 12);
    const staffMembers = [
        { name: 'John Beach', email: 'john@beachside.com', role: 'STAFF' },
        { name: 'Sarah Sun', email: 'sarah@beachside.com', role: 'STAFF' },
    ];
    for (const s of staffMembers) {
        await prisma.user.upsert({
            where: { email: s.email },
            update: {},
            create: {
                ...s,
                password: staffPassword,
                tenantId,
                branchId: newBranch.id,
            },
        });
        console.log(`👤 Created Staff: ${s.name}`);
    }
    const category = await prisma.category.upsert({
        where: { id: 'demo-cat-summer', name_tenantId: { name: 'Summer Specials', tenantId } },
        update: {},
        create: {
            id: 'demo-cat-summer',
            name: 'Summer Specials',
            tenantId,
        },
    });
    const products = [
        { name: 'Tropical Smoothie', price: 15.5, sku: 'TS-001' },
        { name: 'Beach Burger', price: 25.0, sku: 'BB-001' },
        { name: 'Iced Latte', price: 12.0, sku: 'IL-001' },
    ];
    for (const p of products) {
        const product = await prisma.product.upsert({
            where: { sku_tenantId: { sku: p.sku, tenantId } },
            update: {},
            create: {
                ...p,
                tenantId,
                categoryId: category.id,
                productType: 'STANDARD',
            },
        });
        await prisma.stockLevel.upsert({
            where: {
                productId_warehouseId: {
                    productId: product.id,
                    warehouseId: warehouse.id
                }
            },
            update: { quantity: 100 },
            create: {
                productId: product.id,
                warehouseId: warehouse.id,
                quantity: 100,
                minThreshold: 10,
            },
        });
        console.log(`🍔 Created Product & Stock: ${p.name}`);
    }
    console.log('✅ Demo data seed complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=demo_seed.js.map