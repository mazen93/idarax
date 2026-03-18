import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Testing UserSession creation...');
        // We don't actually want to create it, just see if the argument is accepted
        const data = {
            userId: 'bdbf9ca5-4f46-4a20-abc3-ca3b65c10bf8',
            tenantId: 'dummy-tenant-123',
            jti: 'test-jti-' + Date.now(),
            hashedRefreshToken: 'some-hash',
        };
        console.log('Data to send:', data);
        
        // Use a non-existent ID to prevent actual creation if it passes validation
        // or just use findFirst to check if the field is selectable
        const result = await prisma.userSession.findFirst({
            where: {
                hashedRefreshToken: 'some-hash'
            }
        });
        console.log('Success! Field is recognized.');
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
