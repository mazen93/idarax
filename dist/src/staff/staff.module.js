"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffModule = void 0;
const common_1 = require("@nestjs/common");
const shift_service_1 = require("./shift.service");
const shift_controller_1 = require("./shift.controller");
const drawer_service_1 = require("./drawer.service");
const drawer_controller_1 = require("./drawer.controller");
const staff_permissions_service_1 = require("./staff-permissions.service");
const staff_permissions_controller_1 = require("./staff-permissions.controller");
const schedule_service_1 = require("./schedule.service");
const schedule_controller_1 = require("./schedule.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const tenant_module_1 = require("../tenant/tenant.module");
const pos_device_module_1 = require("./pos-device/pos-device.module");
let StaffModule = class StaffModule {
};
exports.StaffModule = StaffModule;
exports.StaffModule = StaffModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, tenant_module_1.TenantModule, pos_device_module_1.PosDeviceModule],
        providers: [shift_service_1.ShiftService, drawer_service_1.DrawerService, staff_permissions_service_1.StaffPermissionsService, schedule_service_1.ScheduleService],
        controllers: [shift_controller_1.ShiftController, drawer_controller_1.DrawerController, staff_permissions_controller_1.StaffPermissionsController, schedule_controller_1.ScheduleController],
        exports: [shift_service_1.ShiftService, drawer_service_1.DrawerService, staff_permissions_service_1.StaffPermissionsService, schedule_service_1.ScheduleService],
    })
], StaffModule);
//# sourceMappingURL=staff.module.js.map