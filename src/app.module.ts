import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

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
import { CdsModule as RetailCdsModule } from './retail/cds/cds.module';
import { DeliveryAggregatorModule } from './delivery-aggregator/delivery-aggregator.module';
import { DrovoModule } from './delivery-aggregator/drovo.module';
import { ObservabilityModule } from './common/observability/observability.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { BackupModule } from './common/backup/backup.module';
import { MarketingModule } from './marketing/marketing.module';
import { SyncModule } from './common/sync/sync.module';
import { AdminModule } from './admin/admin.module';
import { ReportingModule } from './reporting/reporting.module';
import { AuditModule } from './retail/audit/audit.module';
import { AttendanceModule } from './staff/attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
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
    RetailCdsModule,
    DeliveryAggregatorModule,
    DrovoModule,
    BackupModule,
    MarketingModule,
    SyncModule,
    AdminModule,
    ReportingModule,
    AuditModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*path');
  }
}
