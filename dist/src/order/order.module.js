"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const prisma_module_1 = require("../prisma/prisma.module");
const tenant_module_1 = require("../tenant/tenant.module");
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const order_controller_1 = require("./order.controller");
const bull_1 = require("@nestjs/bull");
const order_processor_1 = require("./order.processor");
const inventory_module_1 = require("../retail/inventory/inventory.module");
const offer_module_1 = require("../retail/offer/offer.module");
const refund_service_1 = require("./refund.service");
const staff_module_1 = require("../staff/staff.module");
const numbering_service_1 = require("./numbering.service");
const audit_log_module_1 = require("../common/audit-log/audit-log.module");
const crm_module_1 = require("../crm/crm.module");
const kds_module_1 = require("../restaurant/kds/kds.module");
const mail_module_1 = require("../mail/mail.module");
const notifications_module_1 = require("../notifications/notifications.module");
let OrderModule = class OrderModule {
};
exports.OrderModule = OrderModule;
exports.OrderModule = OrderModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, tenant_module_1.TenantModule, inventory_module_1.InventoryModule, offer_module_1.OfferModule, staff_module_1.StaffModule, audit_log_module_1.AuditLogModule, crm_module_1.CrmModule, kds_module_1.KdsModule, mail_module_1.MailModule, notifications_module_1.NotificationsModule,
            bull_1.BullModule.registerQueue({
                name: 'orders',
            }),
        ],
        providers: [order_service_1.OrderService, order_processor_1.OrderProcessor, refund_service_1.RefundService, numbering_service_1.NumberingService],
        controllers: [order_controller_1.OrderController],
        exports: [order_service_1.OrderService, refund_service_1.RefundService, numbering_service_1.NumberingService],
    })
], OrderModule);
//# sourceMappingURL=order.module.js.map