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
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SyncService = SyncService_1 = class SyncService {
    prisma;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processSyncBatch(tenantId, branchId, orders) {
        this.logger.log(`Processing offline sync batch for tenant ${tenantId}, branch ${branchId}. Orders: ${orders.length}`);
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };
        for (const orderData of orders) {
            try {
                if (orderData.id) {
                    const existing = await this.prisma.order.findUnique({
                        where: { id: orderData.id }
                    });
                    if (existing) {
                        results.success++;
                        continue;
                    }
                }
                await this.prisma.order.create({
                    data: {
                        ...orderData,
                        tenantId,
                        branchId,
                        source: 'POS',
                        status: orderData.status || 'COMPLETED',
                        items: {
                            create: orderData.items?.map((item) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price,
                                variantId: item.variantId,
                                note: item.note
                            }))
                        }
                    }
                });
                results.success++;
            }
            catch (error) {
                this.logger.error(`Sync failure for order ${orderData.id}: ${error.message}`);
                results.failed++;
                results.errors.push({ id: orderData.id, error: error.message });
            }
        }
        return results;
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncService);
//# sourceMappingURL=sync.service.js.map