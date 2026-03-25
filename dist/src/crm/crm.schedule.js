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
var CrmSchedule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmSchedule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let CrmSchedule = CrmSchedule_1 = class CrmSchedule {
    prisma;
    logger = new common_1.Logger(CrmSchedule_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleSlippingCustomerCampaigns() {
        this.logger.debug('Running Slipping Customer Automation...');
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        const slippingCustomers = await this.prisma.customer.findMany({
            where: {
                orders: {
                    some: {},
                    none: {
                        createdAt: { gte: thirtyDaysAgo }
                    }
                }
            },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        let campaignsSent = 0;
        for (const customer of slippingCustomers) {
            const lastOrderDate = new Date(customer.orders[0].createdAt);
            if (lastOrderDate < ninetyDaysAgo) {
                continue;
            }
            const recentCampaign = await this.prisma.marketingCampaign.findFirst({
                where: {
                    customerId: customer.id,
                    campaignType: 'SLIPPING_REENGAGEMENT',
                    sentAt: { gte: thirtyDaysAgo }
                }
            });
            if (recentCampaign) {
                continue;
            }
            const discountCode = `WE_MISS_YOU_10`;
            this.logger.log(`[CRM_AUTOMATION] Sending 10% discount (${discountCode}) to customer ${customer.name} (Tenant: ${customer.tenantId})`);
            await this.prisma.marketingCampaign.create({
                data: {
                    tenantId: customer.tenantId,
                    customerId: customer.id,
                    campaignType: 'SLIPPING_REENGAGEMENT',
                    status: 'SENT',
                    metadata: { type: 'EMAIL/SMS', code: discountCode }
                }
            });
            campaignsSent++;
        }
        this.logger.debug(`Slipping Customer Automation completed. Sent ${campaignsSent} campaigns.`);
    }
};
exports.CrmSchedule = CrmSchedule;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CrmSchedule.prototype, "handleSlippingCustomerCampaigns", null);
exports.CrmSchedule = CrmSchedule = CrmSchedule_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrmSchedule);
//# sourceMappingURL=crm.schedule.js.map