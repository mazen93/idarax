"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferModule = void 0;
const common_1 = require("@nestjs/common");
const offer_service_1 = require("./offer.service");
const offer_controller_1 = require("./offer.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const tenant_module_1 = require("../../tenant/tenant.module");
let OfferModule = class OfferModule {
};
exports.OfferModule = OfferModule;
exports.OfferModule = OfferModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, tenant_module_1.TenantModule],
        controllers: [offer_controller_1.OfferController, offer_controller_1.SeedOfferController],
        providers: [offer_service_1.OfferService],
        exports: [offer_service_1.OfferService]
    })
], OfferModule);
//# sourceMappingURL=offer.module.js.map