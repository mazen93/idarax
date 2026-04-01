"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const cache_manager_1 = require("@nestjs/cache-manager");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const role_module_1 = require("./role/role.module");
const tenant_module_1 = require("./tenant/tenant.module");
const tenant_middleware_1 = require("./tenant/tenant.middleware");
const table_module_1 = require("./restaurant/table/table.module");
const table_section_module_1 = require("./restaurant/table/section/table-section.module");
const public_module_1 = require("./public/public.module");
const reservation_module_1 = require("./restaurant/reservation/reservation.module");
const recipe_module_1 = require("./restaurant/recipe/recipe.module");
const product_module_1 = require("./retail/product/product.module");
const kds_module_1 = require("./restaurant/kds/kds.module");
const serial_module_1 = require("./retail/serial/serial.module");
const order_module_1 = require("./order/order.module");
const inventory_module_1 = require("./retail/inventory/inventory.module");
const crm_module_1 = require("./crm/crm.module");
const payment_module_1 = require("./payment/payment.module");
const analytics_module_1 = require("./analytics/analytics.module");
const export_module_1 = require("./analytics/export/export.module");
const ai_module_1 = require("./analytics/ai/ai.module");
const cms_module_1 = require("./cms/cms.module");
const category_module_1 = require("./retail/category/category.module");
const user_module_1 = require("./user/user.module");
const vendor_module_1 = require("./retail/vendor/vendor.module");
const transfer_module_1 = require("./retail/transfer/transfer.module");
const purchase_order_module_1 = require("./retail/purchase-order/purchase-order.module");
const settings_module_1 = require("./tenant/settings/settings.module");
const branch_module_1 = require("./tenant/branch/branch.module");
const offer_module_1 = require("./retail/offer/offer.module");
const modifier_module_1 = require("./retail/modifier/modifier.module");
const printer_module_1 = require("./restaurant/printer/printer.module");
const staff_module_1 = require("./staff/staff.module");
const cds_module_1 = require("./restaurant/cds/cds.module");
const import_module_1 = require("./retail/import/import.module");
const menu_module_1 = require("./retail/menu/menu.module");
const audit_log_module_1 = require("./common/audit-log/audit-log.module");
const mail_module_1 = require("./mail/mail.module");
const notifications_module_1 = require("./notifications/notifications.module");
const cds_module_2 = require("./retail/cds/cds.module");
const delivery_aggregator_module_1 = require("./delivery-aggregator/delivery-aggregator.module");
const drovo_module_1 = require("./delivery-aggregator/drovo.module");
const observability_module_1 = require("./common/observability/observability.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const backup_module_1 = require("./common/backup/backup.module");
const marketing_module_1 = require("./marketing/marketing.module");
const sync_module_1 = require("./common/sync/sync.module");
const admin_module_1 = require("./admin/admin.module");
const reporting_module_1 = require("./reporting/reporting.module");
const audit_module_1 = require("./retail/audit/audit.module");
const attendance_module_1 = require("./staff/attendance/attendance.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_middleware_1.TenantMiddleware).forRoutes('*path');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cache_manager_1.CacheModule.register({ isGlobal: true, ttl: 60000 }),
            observability_module_1.ObservabilityModule,
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'default',
                    ttl: 60000,
                    limit: 60,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            role_module_1.RoleModule,
            tenant_module_1.TenantModule,
            table_module_1.TableModule,
            reservation_module_1.ReservationModule,
            recipe_module_1.RecipeModule,
            product_module_1.ProductModule,
            kds_module_1.KdsModule,
            serial_module_1.SerialModule,
            order_module_1.OrderModule,
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
            }),
            inventory_module_1.InventoryModule,
            crm_module_1.CrmModule,
            payment_module_1.PaymentModule,
            analytics_module_1.AnalyticsModule,
            export_module_1.ExportModule,
            ai_module_1.AiModule,
            category_module_1.CategoryModule,
            user_module_1.UserModule,
            vendor_module_1.VendorModule,
            transfer_module_1.TransferModule,
            purchase_order_module_1.PurchaseOrderModule,
            settings_module_1.SettingsModule,
            cms_module_1.CmsModule,
            branch_module_1.BranchModule,
            offer_module_1.OfferModule,
            modifier_module_1.ModifierModule,
            table_section_module_1.TableSectionModule,
            public_module_1.PublicModule,
            printer_module_1.PrinterModule,
            staff_module_1.StaffModule,
            cds_module_1.CdsModule,
            import_module_1.ImportModule,
            menu_module_1.MenuModule,
            audit_log_module_1.AuditLogModule,
            mail_module_1.MailModule,
            notifications_module_1.NotificationsModule,
            cds_module_2.CdsModule,
            delivery_aggregator_module_1.DeliveryAggregatorModule,
            drovo_module_1.DrovoModule,
            backup_module_1.BackupModule,
            marketing_module_1.MarketingModule,
            sync_module_1.SyncModule,
            admin_module_1.AdminModule,
            reporting_module_1.ReportingModule,
            audit_module_1.AuditModule,
            attendance_module_1.AttendanceModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map