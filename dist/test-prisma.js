"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        console.log('Testing UserSession creation...');
        const data = {
            userId: 'bdbf9ca5-4f46-4a20-abc3-ca3b65c10bf8',
            tenantId: 'dummy-tenant-123',
            jti: 'test-jti-' + Date.now(),
            hashedRefreshToken: 'some-hash',
        };
        console.log('Data to send:', data);
        const result = await prisma.userSession.findFirst({
            where: {
                hashedRefreshToken: 'some-hash'
            }
        });
        console.log('Success! Field is recognized.');
    }
    catch (e) {
        console.error('Error:', e.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-prisma.js.map