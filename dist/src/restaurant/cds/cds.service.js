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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CdsService = void 0;
const common_1 = require("@nestjs/common");
const cds_gateway_1 = require("./cds.gateway");
let CdsService = class CdsService {
    gateway;
    constructor(gateway) {
        this.gateway = gateway;
    }
    updateCart(dto) {
        this.gateway.broadcastCartUpdate(dto.tenantId, dto.terminalId, {
            items: dto.items,
            subtotal: dto.subtotal,
            tax: dto.tax,
            discount: dto.discount,
            total: dto.total,
            currency: dto.currency,
        });
        return { ok: true };
    }
    startPayment(dto) {
        this.gateway.broadcastPaymentProcessing(dto.tenantId, dto.terminalId);
        return { ok: true };
    }
    completeOrder(dto) {
        this.gateway.broadcastOrderComplete(dto.tenantId, dto.terminalId, {
            orderNumber: dto.orderNumber,
            total: dto.total,
            currency: dto.currency,
        });
        return { ok: true };
    }
    clearSession(dto) {
        this.gateway.broadcastSessionCleared(dto.tenantId, dto.terminalId);
        return { ok: true };
    }
};
exports.CdsService = CdsService;
exports.CdsService = CdsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cds_gateway_1.CdsGateway])
], CdsService);
//# sourceMappingURL=cds.service.js.map