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
var MarketingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const uuid_1 = require("uuid");
let MarketingService = MarketingService_1 = class MarketingService {
    prisma;
    mailService;
    logger = new common_1.Logger(MarketingService_1.name);
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async handleMarketingCron() {
        this.logger.log('Running daily marketing automation scans...');
        await Promise.all([
            this.runWinBackCampaign(),
            this.runBirthdayCampaign(),
        ]);
    }
    async runWinBackCampaign(tenantId) {
        const tenants = await this.prisma.tenant.findMany({
            where: tenantId ? { id: tenantId } : {},
            include: { marketingRule: true }
        });
        for (const tenant of tenants) {
            const rule = tenant.marketingRule;
            if (!rule || !rule.isActive)
                continue;
            const inactiveThreshold = new Date();
            inactiveThreshold.setDate(inactiveThreshold.getDate() - Number(rule.inactiveDays));
            const candidates = await this.prisma.customer.findMany({
                where: {
                    tenantId: tenant.id,
                    orders: {
                        none: {
                            createdAt: { gte: inactiveThreshold }
                        }
                    }
                }
            });
            for (const customer of candidates) {
                if (!customer.email)
                    continue;
                await this.sendCampaignEmail(tenant, customer, {
                    discountValue: rule.discountValue,
                    discountType: rule.discountType,
                    emailSubject: rule.emailSubject,
                    emailContent: rule.emailContent,
                    name: rule.name || 'Win-Back Reward'
                }, 'WIN_BACK');
            }
        }
    }
    async runBirthdayCampaign(tenantId) {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const tenants = await this.prisma.tenant.findMany({
            where: tenantId ? { id: tenantId } : {},
            include: { marketingRule: true }
        });
        for (const tenant of tenants) {
            const rule = tenant.marketingRule;
            if (!rule || !rule.birthdayActive)
                continue;
            const birthdayCustomers = await this.prisma.customer.findMany({
                where: { tenantId: tenant.id, birthday: { not: null } }
            });
            const todayCelebrants = birthdayCustomers.filter((c) => {
                const bday = new Date(c.birthday);
                return (bday.getMonth() + 1) === month && bday.getDate() === day;
            });
            for (const customer of todayCelebrants) {
                if (!customer.email)
                    continue;
                const alreadySent = await this.prisma.marketingCampaign.findFirst({
                    where: {
                        customerId: customer.id,
                        campaignType: 'BIRTHDAY',
                        createdAt: { gte: new Date(today.getFullYear(), 0, 1) }
                    }
                });
                if (alreadySent)
                    continue;
                await this.sendCampaignEmail(tenant, customer, {
                    discountValue: rule.birthdayReward,
                    discountType: rule.birthdayRewardType,
                    emailSubject: rule.birthdaySubject,
                    emailContent: rule.birthdayContent,
                    name: 'Birthday Reward'
                }, 'BIRTHDAY');
            }
        }
    }
    async sendCampaignEmail(tenant, customer, settings, type) {
        try {
            const promoCodeStr = `${type}-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`;
            await this.prisma.promotion.create({
                data: {
                    name: settings.name,
                    type: settings.discountType,
                    discountValue: settings.discountValue,
                    isActive: true,
                    tenantId: tenant.id,
                    promoCodes: {
                        create: {
                            code: promoCodeStr,
                            tenantId: tenant.id,
                            maxUsages: 1,
                        }
                    }
                }
            });
            let emailHtml = settings.emailContent || `
        <h1>Happy {{campaign_name}}, {{customer_name}}!</h1>
        <p>Special gift from ${tenant.name}.</p>
        <p>Enjoy <b>{{discount_value}}{{discount_suffix}} OFF</b> with code:</p>
        <h2 style="color: #10b981;">{{promo_code}}</h2>
      `;
            emailHtml = emailHtml
                .replace(/{{customer_name}}/g, customer.name)
                .replace(/{{campaign_name}}/g, type === 'BIRTHDAY' ? 'Birthday' : 'Reward')
                .replace(/{{promo_code}}/g, promoCodeStr)
                .replace(/{{discount_value}}/g, settings.discountValue.toString())
                .replace(/{{discount_suffix}}/g, settings.discountType === 'PERCENTAGE_OFF' ? '%' : ' ' + tenant.settings?.currency || 'USD');
            const subject = settings.emailSubject.replace(/{{customer_name}}/g, customer.name);
            await this.mailService.sendMail(customer.email, subject, emailHtml);
            await this.prisma.marketingCampaign.create({
                data: {
                    tenantId: tenant.id,
                    customerId: customer.id,
                    campaignType: type,
                    status: 'SENT',
                    metadata: { promoCode: promoCodeStr }
                }
            });
        }
        catch (err) {
            this.logger.error(`[${type}] Failed for customer ${customer.id}: ${err.message}`);
        }
    }
    async getCampaignRule(tenantId) {
        let rule = await this.prisma.marketingCampaignRule.findUnique({
            where: { tenantId }
        });
        if (!rule) {
            rule = await this.prisma.marketingCampaignRule.create({
                data: {
                    tenantId,
                    name: 'Marketing Engine',
                    isActive: true,
                }
            });
        }
        return rule;
    }
    async updateCampaignRule(tenantId, data) {
        const { id, tenantId: _, createdAt, updatedAt, tenant, ...updateData } = data;
        if (updateData.inactiveDays !== undefined)
            updateData.inactiveDays = Number(updateData.inactiveDays);
        if (updateData.discountValue !== undefined)
            updateData.discountValue = Number(updateData.discountValue);
        if (updateData.birthdayReward !== undefined)
            updateData.birthdayReward = Number(updateData.birthdayReward);
        if (updateData.referralReward !== undefined)
            updateData.referralReward = Number(updateData.referralReward);
        if (updateData.referralFriendReward !== undefined)
            updateData.referralFriendReward = Number(updateData.referralFriendReward);
        return this.prisma.marketingCampaignRule.update({
            where: { tenantId },
            data: updateData
        });
    }
    async getCampaignStats(tenantId) {
        const campaigns = await this.prisma.marketingCampaign.findMany({
            where: { tenantId, campaignType: 'WIN_BACK' },
            include: { customer: true },
            orderBy: { sentAt: 'desc' },
        });
        const redemptions = await this.prisma.promoCodeRedemption.findMany({
            where: {
                tenantId,
                promoCode: {
                    code: { startsWith: 'WINBACK-' }
                }
            },
            include: {
                order: true
            }
        });
        const totalSent = campaigns.length;
        const totalConverted = redemptions.length;
        const conversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;
        const totalRevenue = redemptions.reduce((sum, r) => sum + Number(r.order.totalAmount), 0);
        return {
            totalSent,
            totalConverted,
            conversionRate: conversionRate.toFixed(1) + '%',
            totalRevenue: totalRevenue.toFixed(2),
            recentCampaigns: campaigns.slice(0, 10),
        };
    }
};
exports.MarketingService = MarketingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketingService.prototype, "handleMarketingCron", null);
exports.MarketingService = MarketingService = MarketingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map