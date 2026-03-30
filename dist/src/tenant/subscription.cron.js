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
var SubscriptionCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let SubscriptionCronService = SubscriptionCronService_1 = class SubscriptionCronService {
    prisma;
    mailService;
    logger = new common_1.Logger(SubscriptionCronService_1.name);
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async checkExpiringSubscriptions() {
        this.logger.log('Running daily subscription expiry check...');
        const now = new Date();
        const templates = [7, 3, 1];
        for (const days of templates) {
            const targetDateStart = new Date(now);
            targetDateStart.setDate(targetDateStart.getDate() + days);
            targetDateStart.setHours(0, 0, 0, 0);
            const targetDateEnd = new Date(targetDateStart);
            targetDateEnd.setDate(targetDateEnd.getDate() + 1);
            const expiringTenants = await this.prisma.tenant.findMany({
                where: {
                    OR: [
                        {
                            subscriptionExpiresAt: {
                                gte: targetDateStart,
                                lt: targetDateEnd,
                            }
                        },
                        {
                            trialExpiresAt: {
                                gte: targetDateStart,
                                lt: targetDateEnd,
                            }
                        }
                    ],
                },
                include: {
                    users: {
                        orderBy: { createdAt: 'asc' },
                        take: 1
                    }
                }
            });
            for (const tenant of expiringTenants) {
                const owner = tenant.users[0];
                if (!owner?.email)
                    continue;
                const expiryDate = tenant.subscriptionExpiresAt || tenant.trialExpiresAt;
                const subject = `Urgent: Your Idarax Subscription expires in ${days} day(s)`;
                const html = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eaeaea; border-radius: 8px;">
                        <h2 style="color: #10b981; text-align: center;">Subscription Reminder Notice</h2>
                        <p>Hello <strong>${owner.name}</strong>,</p>
                        <p>This is an automated reminder that your subscription for <strong>${tenant.name}</strong> will expire in exactly <strong>${days} day(s)</strong> on ${expiryDate?.toLocaleDateString()}.</p>
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                            <strong>Action Required:</strong> To avoid any interruption in service, including access to POS Terminals, Kitchen Displays, and your Management Dashboard, please renew your plan.
                        </div>
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:3001/en/dashboard/settings" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Renew Subscription Now</a>
                        </p>
                        <br/>
                        <p style="font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eaeaea; padding-top: 10px;">
                            Thank you for choosing Idarax.<br/>
                            <strong>The Idarax Team</strong>
                        </p>
                    </div>
                `;
                try {
                    await this.mailService.sendMail(owner.email, subject, html);
                    this.logger.log(`Sent ${days}-day expiry reminder to ${owner.email} (Tenant: ${tenant.name})`);
                }
                catch (error) {
                    this.logger.error(`Failed to send expiry reminder to ${owner.email}`, error);
                }
            }
        }
    }
};
exports.SubscriptionCronService = SubscriptionCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionCronService.prototype, "checkExpiringSubscriptions", null);
exports.SubscriptionCronService = SubscriptionCronService = SubscriptionCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], SubscriptionCronService);
//# sourceMappingURL=subscription.cron.js.map