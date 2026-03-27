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
var DrovoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrovoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DrovoService = DrovoService_1 = class DrovoService {
    prisma;
    logger = new common_1.Logger(DrovoService_1.name);
    drovoApiUrl = process.env.DROVO_API_URL || 'http://127.0.0.1:3002';
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dispatchOrder(orderId, tenantId) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { id: orderId, tenantId },
                include: {
                    tenant: { include: { settings: true } },
                    customer: true
                }
            });
            if (!order)
                return;
            if (order.orderType !== 'DELIVERY')
                return;
            const settings = order.tenant?.settings;
            if (!settings?.drovoApiKey || !settings?.drovoTenantId) {
                this.logger.debug(`Tenant ${tenantId} missing Drovo credentials. Skipping dispatch.`);
                return;
            }
            const payload = {
                externalOrderId: order.id,
                customerName: order.customer?.name || order.guestName || 'Valued Customer',
                customerPhone: order.customer?.phone || order.guestPhone || '0000000000',
                deliveryAddress: order.deliveryAddress || 'Unknown Delivery Address',
                orderValue: Number(order.totalAmount),
                deliveryFee: Number(order.deliveryFee || 0),
                paymentType: order.paymentMethod === 'CASH' ? 'CASH' : 'PREPAID',
                pickupAddress: order.tenant.name + ' POS',
                dropoffInstructions: order.note
            };
            this.logger.debug(`Dispatching Order ${order.id} to Drovo. Customer: ${payload.customerName}, Fee: ${payload.deliveryFee}`);
            const response = await fetch(`${this.drovoApiUrl}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.drovoApiKey,
                    'tenant-id': settings.drovoTenantId
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000)
            });
            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Failed to dispatch order ${order.id} to Drovo: [${response.status}] ${errorText}`);
                return;
            }
            const drovoOrder = await response.json();
            await this.prisma.order.update({
                where: { id: order.id },
                data: {
                    externalOrderId: drovoOrder.trackingCode || drovoOrder.id,
                    externalPlatform: 'DROVO'
                }
            });
            this.logger.log(`Successfully dispatched Order ${order.id} to Drovo (${drovoOrder.id})`);
            return drovoOrder;
        }
        catch (error) {
            this.logger.error(`Error dispatching to Drovo: ${error.message}`, error.stack);
        }
    }
    async getDeliveryFeeEstimate(tenantId, address, lat, lng) {
        try {
            const settings = await this.prisma.settings.findFirst({
                where: { tenant: { id: tenantId } }
            });
            if (!settings?.drovoApiKey)
                return null;
            const response = await fetch(`${this.drovoApiUrl}/api/orders/estimate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.drovoApiKey
                },
                body: JSON.stringify({
                    deliveryAddress: address,
                    latitude: lat,
                    longitude: lng
                }),
                signal: AbortSignal.timeout(5000)
            });
            if (!response.ok)
                return null;
            return await response.json();
        }
        catch (error) {
            this.logger.error(`Error getting Drovo estimate: ${error.message}`);
            return null;
        }
    }
};
exports.DrovoService = DrovoService;
exports.DrovoService = DrovoService = DrovoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DrovoService);
//# sourceMappingURL=drovo.service.js.map