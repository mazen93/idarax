import { otelSDK } from './tracing';
// Start SDK before NestJS starts
otelSDK.start();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Increase MaxListeners to 20 to accommodate multiple observability/logging layers
process.setMaxListeners(20);

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Logger } from 'nestjs-pino';
import * as Sentry from '@sentry/nestjs';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // nodeProfilingIntegration is disabled because Node v25 lacks prebuilt binaries for it yet
  integrations: [],
  tracesSampleRate: 1.0,
});

async function seedDatabase(app: any) {
  const prisma = app.get(PrismaService) as PrismaService;

  try {
    const tenant = await prisma.tenant.upsert({
      where: { id: 'superadmin-tenant' },
      update: {},
      create: { id: 'superadmin-tenant', name: 'Idarax HQ', type: 'RESTAURANT' },
    });

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

    const plans = [
      { 
        name: 'Starter', 
        price: 29, 
        features: ['BASIC_ANALYTICS', 'STANDARD_POS'] 
      },
      { 
        name: 'Professional', 
        price: 79, 
        features: ['BASIC_ANALYTICS', 'STANDARD_POS', 'UPSELL_ENGINE', 'ADVANCED_REPORTING'] 
      },
      { 
        name: 'Enterprise', 
        price: 199, 
        features: [
          'BASIC_ANALYTICS', 
          'STANDARD_POS', 
          'UPSELL_ENGINE', 
          'ADVANCED_REPORTING', 
          'KDS_ANALYTICS', 
          'WIN_BACK_MARKETING', 
          'WHITE_LABELING',
          'OFFLINE_RESILIENCE'
        ] 
      },
    ];
    for (const plan of plans) {
      await (prisma as any).subscriptionPlan.upsert({
        where: { id: `plan-${plan.name.toLowerCase()}` },
        update: plan,
        create: { id: `plan-${plan.name.toLowerCase()}`, ...plan, isActive: true },
      });
    }

    const enterprisePlan = await (prisma as any).subscriptionPlan.findUnique({ where: { id: 'plan-enterprise' } });

    const demoTenant = await (prisma as any).tenant.upsert({
      where: { id: 'dummy-tenant-123' },
      update: { planId: 'plan-enterprise' },
      create: { id: 'dummy-tenant-123', name: 'Demo Restaurant', type: 'RESTAURANT', planId: 'plan-enterprise' },
    });

    const demoPassword = await bcrypt.hash('Demo@12345', 10);
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

    const demoBranch = await prisma.branch.upsert({
      where: { name_tenantId: { name: 'Main Branch', tenantId: demoTenant.id } },
      update: {},
      create: { id: 'default-branch', name: 'Main Branch', tenantId: demoTenant.id, isActive: true },
    });

    await (prisma as any).user.updateMany({
      where: { tenantId: demoTenant.id, branchId: null },
      data: { branchId: demoBranch.id }
    });

    console.log('✅ Database seeded!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  await seedDatabase(app);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    errorHttpStatusCode: 422,
  }));

  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Idarax Enterprise POS API')
    .setDescription('Full API documentation for the Idarax POS system.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
