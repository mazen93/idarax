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
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const prisma_service_1 = require("./prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
async function seedDatabase(app) {
    const prisma = app.get(prisma_service_1.PrismaService);
    try {
        const tenant = await prisma.tenant.upsert({
            where: { id: 'superadmin-tenant' },
            update: {},
            create: { id: 'superadmin-tenant', name: 'Idarax HQ', type: 'RESTAURANT' },
        });
        const hashedPassword = await bcrypt.hash('Admin@12345', 12);
        await prisma.user.upsert({
            where: { email: 'admin@idarax.io' },
            update: { password: hashedPassword },
            create: {
                email: 'admin@idarax.io',
                password: hashedPassword,
                name: 'Super Admin',
                role: 'SUPER_ADMIN',
                tenantId: tenant.id,
            },
        });
        const plans = [
            { name: 'Starter', price: 29, features: ['Up to 20 tables', '3 staff accounts'] },
            { name: 'Professional', price: 79, features: ['Unlimited tables', '20 staff accounts', 'AI analytics'] },
            { name: 'Enterprise', price: 199, features: ['Everything in Pro', 'Unlimited staff'] },
        ];
        for (const plan of plans) {
            await prisma.subscriptionPlan.upsert({
                where: { id: `plan-${plan.name.toLowerCase()}` },
                update: plan,
                create: { id: `plan-${plan.name.toLowerCase()}`, ...plan, isActive: true },
            });
        }
        console.log('🌱 Seeded Superadmin Subscription Plans');
        const sections = [
            { section: 'hero', title: 'The Operating System for Modern Restaurants', content: 'Unify POS, KDS, & Analytics.' },
        ];
        for (const sec of sections) {
            await prisma.landingContent.upsert({
                where: { section: sec.section }, update: sec, create: sec,
            });
        }
        const demoTenant = await prisma.tenant.upsert({
            where: { id: 'dummy-tenant-123' },
            update: {},
            create: {
                id: 'dummy-tenant-123',
                name: 'Demo Restaurant',
                type: 'RESTAURANT',
            },
        });
        const demoPassword = await bcrypt.hash('Demo@12345', 10);
        await prisma.user.updateMany({
            where: {
                tenantId: demoTenant.id,
                pinCode: '123123',
                NOT: { email: 'demo@restaurant.com' }
            },
            data: { pinCode: null }
        });
        await prisma.user.upsert({
            where: { email: 'demo@restaurant.com' },
            update: { password: demoPassword, pinCode: '123123' },
            create: {
                email: 'demo@restaurant.com',
                password: demoPassword,
                name: 'Demo Admin',
                role: 'ADMIN',
                tenantId: demoTenant.id,
                pinCode: '123123',
            },
        });
        const categoryCount = await prisma.category.count({ where: { tenantId: demoTenant.id } });
        if (categoryCount === 0) {
            console.log('📦 Seeding sample categories and products...');
            const catBreakfast = await prisma.category.create({
                data: { name: 'Breakfast', nameAr: 'فطور', tenantId: demoTenant.id }
            });
            const catMain = await prisma.category.create({
                data: { name: 'Main Courses', nameAr: 'الأطباق الرئيسية', tenantId: demoTenant.id }
            });
            await prisma.product.createMany({
                data: [
                    { name: 'Classic Pancakes', nameAr: 'بانكيك كلاسيك', price: 15.00, categoryId: catBreakfast.id, tenantId: demoTenant.id, sku: 'BK-01' },
                    { name: 'Fresh Orange Juice', nameAr: 'عصير برتقال طازج', price: 10.00, categoryId: catBreakfast.id, tenantId: demoTenant.id, sku: 'DR-01' },
                    { name: 'Beef Burger', nameAr: 'برجر لحم', price: 25.00, categoryId: catMain.id, tenantId: demoTenant.id, sku: 'MN-01' },
                ]
            });
            await prisma.table.createMany({
                data: [
                    { number: 1, capacity: 4, tenantId: demoTenant.id, status: 'AVAILABLE' },
                    { number: 2, capacity: 2, tenantId: demoTenant.id, status: 'AVAILABLE' },
                ]
            });
            await prisma.menu.create({
                data: {
                    name: 'Breakfast Menu',
                    nameAr: 'قائمة الفطور',
                    startTime: '05:00',
                    endTime: '12:00',
                    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                    tenantId: demoTenant.id,
                    categories: {
                        create: [{ categoryId: catBreakfast.id }]
                    }
                }
            });
            const demoBranch = await prisma.branch.upsert({
                where: { name_tenantId: { name: 'Main Branch', tenantId: demoTenant.id } },
                update: {},
                create: {
                    id: 'default-branch',
                    name: 'Main Branch',
                    tenantId: demoTenant.id,
                    isActive: true,
                },
            });
            await prisma.user.updateMany({
                where: { tenantId: demoTenant.id },
                data: { branchId: demoBranch.id }
            });
            console.log('🏛️ Seeded Main Branch for Demo Tenant');
        }
        const demoBranch = await prisma.branch.upsert({
            where: { name_tenantId: { name: 'Main Branch', tenantId: demoTenant.id } },
            update: {},
            create: {
                id: 'default-branch',
                name: 'Main Branch',
                tenantId: demoTenant.id,
                isActive: true,
            },
        });
        await prisma.user.updateMany({
            where: { tenantId: demoTenant.id, branchId: null },
            data: { branchId: demoBranch.id }
        });
        console.log('🏛️ Seeded Main Branch for Demo Tenant');
        console.log('✅ Dummy Tenant Seeded: dummy-tenant-123 / demo@restaurant.com');
        console.log('✅ Database seeded inside NestJS!');
    }
    catch (error) {
        console.error('❌ Error during seeding:', error);
    }
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    await seedDatabase(app);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: 422,
    }));
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Idarax Enterprise POS API')
        .setDescription('Full API documentation for the Idarax POS system, including Retail, Restaurant, and Multi-tenancy features.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map