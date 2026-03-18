"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const user = await prisma.user.findFirst();
    console.log('User email:', user?.email);
    console.log('User password hash:', user?.password);
}
run().finally(() => prisma.$disconnect());
//# sourceMappingURL=get_user.js.map