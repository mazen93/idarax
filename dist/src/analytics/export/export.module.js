"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportModule = void 0;
const common_1 = require("@nestjs/common");
const export_service_1 = require("./export.service");
const export_controller_1 = require("./export.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const tenant_module_1 = require("../../tenant/tenant.module");
const bull_1 = require("@nestjs/bull");
const scheduled_report_service_1 = require("./scheduled-report.service");
const scheduled_report_processor_1 = require("./scheduled-report.processor");
let ExportModule = class ExportModule {
};
exports.ExportModule = ExportModule;
exports.ExportModule = ExportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            tenant_module_1.TenantModule,
            bull_1.BullModule.registerQueue({
                name: 'reports',
            }),
        ],
        providers: [export_service_1.ExportService, scheduled_report_service_1.ScheduledReportService, scheduled_report_processor_1.ScheduledReportProcessor],
        controllers: [export_controller_1.ExportController],
    })
], ExportModule);
//# sourceMappingURL=export.module.js.map