"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdsModule = void 0;
const common_1 = require("@nestjs/common");
const cds_gateway_1 = require("./cds.gateway");
const cds_service_1 = require("./cds.service");
const cds_controller_1 = require("./cds.controller");
let CdsModule = class CdsModule {
};
exports.CdsModule = CdsModule;
exports.CdsModule = CdsModule = __decorate([
    (0, common_1.Module)({
        providers: [cds_gateway_1.CdsGateway, cds_service_1.CdsService],
        controllers: [cds_controller_1.CdsController],
        exports: [cds_service_1.CdsService, cds_gateway_1.CdsGateway],
    })
], CdsModule);
//# sourceMappingURL=cds.module.js.map