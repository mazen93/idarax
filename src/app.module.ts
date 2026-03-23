import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { TenantModule } from './tenant/tenant.module';
import { TenantMiddleware } from './tenant/tenant.middleware';
import { TableModule } from './restaurant/table/table.module';
import { TableSectionModule } from './restaurant/table/section/table-section.module';
import { PublicModule } from './public/public.module';
import { ReservationModule } from './restaurant/reservation/reservation.module';
import { RecipeModule } from './restaurant/recipe/recipe.module';
import { ProductModule } from './retail/product/product.module';
import { KdsModule } from './restaurant/kds/kds.module';
import { SerialModule } from './retail/serial/serial.module';
import { OrderModule } from './order/order.module';
import { BullModule } from '@nestjs/bull';
import { InventoryModule } from './retail/inventory/inventory.module';
import { CrmModule } from './crm/crm.module';
import { PaymentModule } from './payment/payment.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExportModule } from './analytics/export/export.module';
import { AiModule } from './analytics/ai/ai.module';
import { CmsModule } from './cms/cms.module';
import { CategoryModule } from './retail/category/category.module';
import { UserModule } from './user/user.module';
import { VendorModule } from './retail/vendor/vendor.module';
import { TransferModule } from './retail/transfer/transfer.module';
import { PurchaseOrderModule } from './retail/purchase-order/purchase-order.module';
import { SettingsModule } from './tenant/settings/settings.module';
import { BranchModule } from './tenant/branch/branch.module';
import { OfferModule } from './retail/offer/offer.module';
import { ModifierModule } from './retail/modifier/modifier.module';
import { PrinterModule } from './restaurant/printer/printer.module';
import { StaffModule } from './staff/staff.module';
import { CdsModule } from './restaurant/cds/cds.module';
import { ImportModule } from './retail/import/import.module';
import { MenuModule } from './retail/menu/menu.module';
import { AuditLogModule } from './common/audit-log/audit-log.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,  // 1 minute window
        limit: 60,   // 60 requests per minute by default
      },
    ]),
    PrismaModule,
    AuthModule,
    RoleModule,
    TenantModule,
    TableModule,
    ReservationModule,
    RecipeModule,
    ProductModule,
    KdsModule,
    SerialModule,
    OrderModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    InventoryModule,
    CrmModule,
    PaymentModule,
    AnalyticsModule,
    ExportModule,
    AiModule,
    CategoryModule,
    UserModule,
    VendorModule,
    TransferModule,
    PurchaseOrderModule,
    SettingsModule,
    CmsModule,
    BranchModule,
    OfferModule,
    ModifierModule,
    TableSectionModule,
    PublicModule,
    PrinterModule,
    StaffModule,
    CdsModule,
    ImportModule,
    MenuModule,
    AuditLogModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply ThrottlerGuard globally so all routes are rate-limited
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
