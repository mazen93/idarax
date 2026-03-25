const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        await prisma.user.create({
            data: {
                name: "Test",
                email: "test.fail@restaurant.com",
                password: "123",
                tenantId: "mock",
                pinCode: null
            },
            select: { id: true, name: true, email: true, role: true, roleId: true, createdAt: true, pinCode: true }
        });
    } catch (e) {
        console.error("Prisma error:", e.message);
    }
}
main();
