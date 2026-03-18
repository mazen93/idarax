"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierModule = void 0;
const common_1 = require("@nestjs/common");
const modifier_controller_1 = require("./modifier.controller");
const modifier_service_1 = require("./modifier.service");
const prisma_module_1 = require("../../prisma/prisma.module");
const tenant_module_1 = require("../../tenant/tenant.module");
let ModifierModule = class ModifierModule {
};
exports.ModifierModule = ModifierModule;
exports.ModifierModule = ModifierModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, tenant_module_1.TenantModule],
        controllers: [modifier_controller_1.ModifierController],
        providers: [modifier_service_1.ModifierService],
        exports: [modifier_service_1.ModifierService],
    })
], ModifierModule);
//# sourceMappingURL=modifier.module.js.map