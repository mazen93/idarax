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
const prisma = new client_1.PrismaClient();
async function run() {
    const email = 'admin@idarax.io';
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
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
    }
    catch (error) {
        console.error('Failed to create super admin:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=create_super_admin.js.map