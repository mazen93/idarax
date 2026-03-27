"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const public_service_1 = require("../public/public.service");
const prisma = new client_1.PrismaClient();
const publicService = new public_service_1.PublicService(prisma);
async function run() {
    const tenantId = 'dummy-tenant-123';
    const mainBranchId = 'default-branch';
    const downtownBranchId = 'a66fe2a8-b6b9-47f8-b63b-61b62b4f1027';
    console.log('--- Checking Main Branch ---');
    const mainMenu = await publicService.getMenu(tenantId, mainBranchId);
    const mainProductCount = mainMenu.reduce((sum, cat) => sum + cat.products.length, 0);
    console.log(`Main Branch Menu has ${mainProductCount} products.`);
    console.log('\n--- Checking DownTown Branch ---');
    const downtownMenu = await publicService.getMenu(tenantId, downtownBranchId);
    const downtownProductCount = downtownMenu.reduce((sum, cat) => sum + cat.products.length, 0);
    console.log(`DownTown Branch Menu has ${downtownProductCount} products.`);
    process.exit(0);
}
run();
//# sourceMappingURL=verify_menu_fix.js.map