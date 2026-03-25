"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryAggregatorController = void 0;
const common_1 = require("@nestjs/common");
const delivery_aggregator_service_1 = require("./delivery-aggregator.service");
const swagger_1 = require("@nestjs/swagger");
let DeliveryAggregatorController = class DeliveryAggregatorController {
    service;
    constructor(service) {
        this.service = service;
    }
    handleWebhook(platform, payload) {
        return this.service.handleWebhook(platform, payload);
    }
};
exports.DeliveryAggregatorController = DeliveryAggregatorController;
__decorate([
    (0, common_1.Post)('webhook/:platform'),
    (0, swagger_1.ApiOperation)({ summary: 'Receive order webhooks from Talabat, Deliveroo, UberEats' }),
    __param(0, (0, common_1.Param)('platform')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DeliveryAggregatorController.prototype, "handleWebhook", null);
exports.DeliveryAggregatorController = DeliveryAggregatorController = __decorate([
    (0, swagger_1.ApiTags)('Delivery Aggregator'),
    (0, common_1.Controller)('delivery-aggregator'),
    __metadata("design:paramtypes", [delivery_aggregator_service_1.DeliveryAggregatorService])
], DeliveryAggregatorController);
//# sourceMappingURL=delivery-aggregator.controller.js.map