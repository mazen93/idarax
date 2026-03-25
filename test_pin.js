const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

async function test() {
  const users = await prisma.user.findMany({ select: { email: true, role: true, pinCode: true, tenantId: true }});
  console.log("Users in DB:", users);

  for (const user of users) {
    if (user.pinCode) {
      console.log(`\nTesting PIN login for ${user.email} (Role: ${user.role}, PIN: ${user.pinCode})`);
      try {
        const res = await axios.post('http://localhost:3000/api/v1/auth/pin-login', {
          pin: user.pinCode,
          tenantId: user.tenantId
        });
        console.log("API Response Role:", res.data.data?.role || res.data.role);
        console.log("API Response Permissions:", res.data.data?.permissions || res.data.permissions);
      } catch (e) {
        console.log("Error:", e.response?.data || e.message);
      }
    }
  }
}
test().catch(console.error).finally(() => prisma.$disconnect());
