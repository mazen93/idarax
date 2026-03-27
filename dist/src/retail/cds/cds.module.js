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
const cds_controller_1 = require("./cds.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
const notifications_module_1 = require("../../notifications/notifications.module");
const ai_module_1 = require("../../analytics/ai/ai.module");
let CdsModule = class CdsModule {
};
exports.CdsModule = CdsModule;
exports.CdsModule = CdsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, notifications_module_1.NotificationsModule, ai_module_1.AiModule],
        controllers: [cds_controller_1.CdsController],
    })
], CdsModule);
//# sourceMappingURL=cds.module.js.map