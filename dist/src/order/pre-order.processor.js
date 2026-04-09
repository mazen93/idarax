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
var PreOrderProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreOrderProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
let PreOrderProcessor = PreOrderProcessor_1 = class PreOrderProcessor {
    orderService;
    logger = new common_1.Logger(PreOrderProcessor_1.name);
    constructor(orderService) {
        this.orderService = orderService;
    }
    async handleFirePreOrder(job) {
        const { orderId } = job.data;
        this.logger.log(`[PreOrder] Firing pre-order ${orderId} to kitchen...`);
        try {
            const result = await this.orderService.firePreOrder(orderId);
            if (result) {
                this.logger.log(`[PreOrder] Successfully fired pre-order ${orderId}.`);
            }
            else {
                this.logger.warn(`[PreOrder] Pre-order ${orderId} was not SCHEDULED (may have been cancelled).`);
            }
        }
        catch (err) {
            this.logger.error(`[PreOrder] Failed to fire pre-order ${orderId}:`, err);
            throw err;
        }
    }
};
exports.PreOrderProcessor = PreOrderProcessor;
__decorate([
    (0, bull_1.Process)('fire-pre-order'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PreOrderProcessor.prototype, "handleFirePreOrder", null);
exports.PreOrderProcessor = PreOrderProcessor = PreOrderProcessor_1 = __decorate([
    (0, bull_1.Processor)('pre-orders'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], PreOrderProcessor);
//# sourceMappingURL=pre-order.processor.js.map