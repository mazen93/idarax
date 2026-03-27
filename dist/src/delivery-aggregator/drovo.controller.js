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
var DrovoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrovoController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DrovoController = DrovoController_1 = class DrovoController {
    prisma;
    logger = new common_1.Logger(DrovoController_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleWebhook(tenantId, signature, payload, req) {
        this.logger.log(`Received Drovo webhook for tenant ${tenantId}`);
        const settings = await this.prisma.settings.findUnique({
            where: { tenantId }
        });
        const { event, data } = payload;
        if (event !== 'ORDER_STATUS_CHANGED' || !data) {
            return { received: true };
        }
        const idaraxOrderId = data.externalOrderId;
        const drovoStatus = data.status;
        if (!idaraxOrderId) {
            this.logger.warn(`Drovo webhook order missing externalOrderId`);
            return { received: true };
        }
        let newStatus = null;
        switch (drovoStatus) {
            case 'PENDING':
                newStatus = client_1.OrderStatus.PREPARING;
                break;
            case 'ASSIGNED':
            case 'ACCEPTED':
            case 'ARRIVED_PICKUP':
            case 'PICKED_UP':
                newStatus = client_1.OrderStatus.READY;
                break;
            case 'IN_TRANSIT':
                newStatus = client_1.OrderStatus.COMPLETED;
                break;
            case 'DELIVERED':
                newStatus = client_1.OrderStatus.COMPLETED;
                break;
            case 'CANCELLED':
            case 'CANCELLED_BY_CUSTOMER':
            case 'REJECTED':
            case 'FAILED':
                newStatus = client_1.OrderStatus.CANCELLED;
                break;
            default:
                break;
        }
        if (newStatus) {
            await this.prisma.order.update({
                where: { id: idaraxOrderId },
                data: {
                    status: newStatus,
                    externalOrderId: data.trackingCode || data.id,
                    note: data.driver ? `Driver: ${data.driver.name} - ${data.driver.phone}` : undefined
                }
            }).catch(e => {
                this.logger.error(`Failed to update order status from Drovo webhook for ${idaraxOrderId}: ${e.message}`);
            });
            this.logger.log(`Mapped Drovo ${drovoStatus} -> Idarax ${newStatus} for Order ${idaraxOrderId}`);
        }
        return { received: true };
    }
};
exports.DrovoController = DrovoController;
__decorate([
    (0, common_1.Post)('webhook/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Headers)('x-drovo-signature')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DrovoController.prototype, "handleWebhook", null);
exports.DrovoController = DrovoController = DrovoController_1 = __decorate([
    (0, common_1.Controller)('delivery-aggregator/drovo'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DrovoController);
//# sourceMappingURL=drovo.controller.js.map