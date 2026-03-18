import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, UnprocessableEntityException } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

async function seedDatabase(app: any) {
  const prisma = app.get(PrismaService) as PrismaService;

  try {
    // 1. Superadmin Tenant
    const tenant = await prisma.tenant.upsert({
      where: { id: 'superadmin-tenant' },
      update: {},
      create: { id: 'superadmin-tenant', name: 'Idarax HQ', type: 'RESTAURANT' },
    });

    // 2. Superadmin User
    const hashedPassword = await bcrypt.hash('Admin@12345', 12);
    await (prisma as any).user.upsert({
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

    // 3. Plans
    const plans = [
      { name: 'Starter', price: 29, features: ['Up to 20 tables', '3 staff accounts'] },
      { name: 'Professional', price: 79, features: ['Unlimited tables', '20 staff accounts', 'AI analytics'] },
      { name: 'Enterprise', price: 199, features: ['Everything in Pro', 'Unlimited staff'] },
    ];
    for (const plan of plans) {
      await (prisma as any).subscriptionPlan.upsert({
        where: { id: `plan-${plan.name.toLowerCase()}` },
        update: plan,
        create: { id: `plan-${plan.name.toLowerCase()}`, ...plan, isActive: true },
      });
    }
    console.log('🌱 Seeded Superadmin Subscription Plans');

    // 4. Content
    const sections = [
      { section: 'hero', title: 'The Operating System for Modern Restaurants', content: 'Unify POS, KDS, & Analytics.' },
    ];
    for (const sec of sections) {
      await (prisma as any).landingContent.upsert({
        where: { section: sec.section }, update: sec, create: sec,
      });
    }

    // Seed Dummy Tenant for User Testing
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
    // Clear conflicting pin codes in the same tenant to avoid unique constraint error
    await (prisma as any).user.updateMany({
      where: {
        tenantId: demoTenant.id,
        pinCode: '123123',
        NOT: { email: 'demo@restaurant.com' }
      },
      data: { pinCode: null }
    });

    await (prisma as any).user.upsert({
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

    // Seed Categories and Products if none exist
    const categoryCount = await (prisma as any).category.count({ where: { tenantId: demoTenant.id } });
    if (categoryCount === 0) {
      console.log('📦 Seeding sample categories and products...');
      const catBreakfast = await (prisma as any).category.create({
        data: { name: 'Breakfast', nameAr: 'فطور', tenantId: demoTenant.id }
      });
      const catMain = await (prisma as any).category.create({
        data: { name: 'Main Courses', nameAr: 'الأطباق الرئيسية', tenantId: demoTenant.id }
      });

      await (prisma as any).product.createMany({
        data: [
          { name: 'Classic Pancakes', nameAr: 'بانكيك كلاسيك', price: 15.00, categoryId: catBreakfast.id, tenantId: demoTenant.id, sku: 'BK-01' },
          { name: 'Fresh Orange Juice', nameAr: 'عصير برتقال طازج', price: 10.00, categoryId: catBreakfast.id, tenantId: demoTenant.id, sku: 'DR-01' },
          { name: 'Beef Burger', nameAr: 'برجر لحم', price: 25.00, categoryId: catMain.id, tenantId: demoTenant.id, sku: 'MN-01' },
        ]
      });

      await (prisma as any).table.createMany({
        data: [
          { number: 1, capacity: 4, tenantId: demoTenant.id, status: 'AVAILABLE' },
          { number: 2, capacity: 2, tenantId: demoTenant.id, status: 'AVAILABLE' },
        ]
      });

      // Create a Sample Breakfast Menu (Scheduled for morning)
      await (prisma as any).menu.create({
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

      // Seed a default branch for the dummy tenant
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

      // Link existing users to this branch
      await (prisma as any).user.updateMany({
        where: { tenantId: demoTenant.id },
        data: { branchId: demoBranch.id }
      });
      console.log('🏛️ Seeded Main Branch for Demo Tenant');
    }

    // Seed a default branch for the dummy tenant (ensure it runs even if cat exists)
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

    // Link existing users to this branch if they don't have one
    await (prisma as any).user.updateMany({
      where: { tenantId: demoTenant.id, branchId: null },
      data: { branchId: demoBranch.id }
    });

    console.log('🏛️ Seeded Main Branch for Demo Tenant');
    console.log('✅ Dummy Tenant Seeded: dummy-tenant-123 / demo@restaurant.com');
    console.log('✅ Database seeded inside NestJS!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set Global Prefix
  app.setGlobalPrefix('api/v1');

  // Seed Database on Boot
  await seedDatabase(app);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    errorHttpStatusCode: 422,
  }));

  // Register Global Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Register Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Idarax Enterprise POS API')
    .setDescription('Full API documentation for the Idarax POS system, including Retail, Restaurant, and Multi-tenancy features.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
