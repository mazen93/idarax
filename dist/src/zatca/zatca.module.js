"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZatcaModule = void 0;
const common_1 = require("@nestjs/common");
const zatca_tlv_service_1 = require("./zatca-tlv.service");
const zatca_xml_service_1 = require("./zatca-xml.service");
const zatca_crypto_service_1 = require("./zatca-crypto.service");
const zatca_reporting_service_1 = require("./zatca-reporting.service");
const zatca_onboarding_service_1 = require("./zatca-onboarding.service");
const zatca_controller_1 = require("./zatca.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let ZatcaModule = class ZatcaModule {
};
exports.ZatcaModule = ZatcaModule;
exports.ZatcaModule = ZatcaModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [zatca_controller_1.ZatcaController],
        providers: [
            zatca_tlv_service_1.ZatcaTlvService,
            zatca_xml_service_1.ZatcaXmlService,
            zatca_crypto_service_1.ZatcaCryptoService,
            zatca_reporting_service_1.ZatcaReportingService,
            zatca_onboarding_service_1.ZatcaOnboardingService,
        ],
        exports: [
            zatca_tlv_service_1.ZatcaTlvService,
            zatca_xml_service_1.ZatcaXmlService,
            zatca_crypto_service_1.ZatcaCryptoService,
            zatca_reporting_service_1.ZatcaReportingService,
            zatca_onboarding_service_1.ZatcaOnboardingService,
        ],
    })
], ZatcaModule);
//# sourceMappingURL=zatca.module.js.map