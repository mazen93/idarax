"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableSectionModule = void 0;
const common_1 = require("@nestjs/common");
const table_section_service_1 = require("./table-section.service");
const table_section_controller_1 = require("./table-section.controller");
const prisma_module_1 = require("../../../prisma/prisma.module");
const tenant_module_1 = require("../../../tenant/tenant.module");
let TableSectionModule = class TableSectionModule {
};
exports.TableSectionModule = TableSectionModule;
exports.TableSectionModule = TableSectionModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, tenant_module_1.TenantModule],
        controllers: [table_section_controller_1.TableSectionController],
        providers: [table_section_service_1.TableSectionService],
        exports: [table_section_service_1.TableSectionService],
    })
], TableSectionModule);
//# sourceMappingURL=table-section.module.js.map