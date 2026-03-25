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
exports.DeliveryAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("../order/order.service");
const prisma_service_1 = require("../prisma/prisma.service");
let DeliveryAggregatorService = class DeliveryAggregatorService {
    orderService;
    prisma;
    constructor(orderService, prisma) {
        this.orderService = orderService;
        this.prisma = prisma;
    }
    async handleWebhook(platform, payload) {
        const tenantId = payload.tenantId;
        const branchId = payload.branchId;
        const items = await Promise.all(payload.items.map(async (item) => {
            const product = await this.prisma.client.product.findFirst({
                where: {
                    OR: [
                        { sku: item.sku },
                        { name: item.name }
                    ]
                }
            });
            if (!product)
                throw new common_1.NotFoundException(`Product not found: ${item.sku || item.name}`);
            return {
                productId: product.id,
                quantity: item.quantity,
                price: item.price,
                note: `[${platform.toUpperCase()}] ${item.note || ''}`
            };
        }));
        return this.orderService.createDirect({
            tableId: undefined,
            customerId: undefined,
            items,
            totalAmount: payload.totalAmount,
            orderType: 'DELIVERY',
            source: 'DELIVERY_PARTNER',
            externalPlatform: platform.toUpperCase(),
            externalOrderId: payload.orderId,
            status: 'PREPARING',
            guestName: payload.customer?.name,
            guestPhone: payload.customer?.phone,
            deliveryAddress: payload.customer?.address,
            paymentMethod: 'EXTERNAL',
            paidAmount: payload.totalAmount,
        });
    }
};
exports.DeliveryAggregatorService = DeliveryAggregatorService;
exports.DeliveryAggregatorService = DeliveryAggregatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        prisma_service_1.PrismaService])
], DeliveryAggregatorService);
//# sourceMappingURL=delivery-aggregator.service.js.map