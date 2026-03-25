"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryAggregatorModule = void 0;
const common_1 = require("@nestjs/common");
const delivery_aggregator_service_1 = require("./delivery-aggregator.service");
const delivery_aggregator_controller_1 = require("./delivery-aggregator.controller");
const order_module_1 = require("../order/order.module");
const prisma_module_1 = require("../prisma/prisma.module");
let DeliveryAggregatorModule = class DeliveryAggregatorModule {
};
exports.DeliveryAggregatorModule = DeliveryAggregatorModule;
exports.DeliveryAggregatorModule = DeliveryAggregatorModule = __decorate([
    (0, common_1.Module)({
        imports: [order_module_1.OrderModule, prisma_module_1.PrismaModule],
        providers: [delivery_aggregator_service_1.DeliveryAggregatorService],
        controllers: [delivery_aggregator_controller_1.DeliveryAggregatorController],
    })
], DeliveryAggregatorModule);
//# sourceMappingURL=delivery-aggregator.module.js.map