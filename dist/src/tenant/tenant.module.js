"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const tenant_service_1 = require("./tenant.service");
const tenant_controller_1 = require("./tenant.controller");
const branch_settings_service_1 = require("./branch-settings/branch-settings.service");
const branch_settings_controller_1 = require("./branch-settings/branch-settings.controller");
const subscription_cron_1 = require("./subscription.cron");
let TenantModule = class TenantModule {
};
exports.TenantModule = TenantModule;
exports.TenantModule = TenantModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => prisma_module_1.PrismaModule)],
        providers: [tenant_service_1.TenantService, branch_settings_service_1.BranchSettingsService, subscription_cron_1.SubscriptionCronService],
        controllers: [tenant_controller_1.TenantAdminController, branch_settings_controller_1.BranchSettingsController],
        exports: [tenant_service_1.TenantService, branch_settings_service_1.BranchSettingsService],
    })
], TenantModule);
//# sourceMappingURL=tenant.module.js.map