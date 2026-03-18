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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
let PaymentService = class PaymentService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async processPayment(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const status = Math.random() > 0.1 ? 'COMPLETED' : 'FAILED';
        const reference = `MOCK_REF_${Math.random().toString(36).substring(7).toUpperCase()}`;
        const payment = await this.prisma.payment.create({
            data: {
                orderId: dto.orderId,
                amount: dto.amount,
                method: dto.method,
                status: status,
                reference: reference,
            },
        });
        if (status === 'COMPLETED') {
            const order = await this.prisma.order.findUnique({
                where: { id: dto.orderId },
                select: { tableId: true },
            });
            if (order?.tableId) {
                await this.prisma.table.update({
                    where: { id: order.tableId },
                    data: { status: 'AVAILABLE' },
                });
            }
        }
        return payment;
    }
    async getPaymentsByOrder(orderId) {
        return this.prisma.payment.findMany({
            where: { orderId },
        });
    }
    async updatePaymentStatus(id, dto) {
        return this.prisma.payment.update({
            where: { id },
            data: { status: dto.status },
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map