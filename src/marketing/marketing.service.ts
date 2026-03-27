import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleMarketingCron() {
    this.logger.log('Running daily marketing automation scans...');
    await Promise.all([
      this.runWinBackCampaign(),
      this.runBirthdayCampaign(),
    ]);
  }

  async runWinBackCampaign(tenantId?: string) {
    const tenants = await this.prisma.tenant.findMany({
      where: tenantId ? { id: tenantId } : {},
      include: { marketingRule: true }
    });

    for (const tenant of tenants) {
      const rule = (tenant as any).marketingRule;
      if (!rule || !rule.isActive) continue;

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
        if (!customer.email) continue;
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

  async runBirthdayCampaign(tenantId?: string) {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const tenants = await this.prisma.tenant.findMany({
      where: tenantId ? { id: tenantId } : {},
      include: { marketingRule: true }
    });

    for (const tenant of tenants) {
      const rule = (tenant as any).marketingRule;
      if (!rule || !rule.birthdayActive) continue;

      // Filter in memory for cross-DB compatibility (month/day check)
      const birthdayCustomers = await (this.prisma as any).customer.findMany({
        where: { tenantId: tenant.id, birthday: { not: null } }
      });

      const todayCelebrants = birthdayCustomers.filter((c: any) => {
        const bday = new Date(c.birthday);
        return (bday.getMonth() + 1) === month && bday.getDate() === day;
      });

      for (const customer of todayCelebrants) {
        if (!customer.email) continue;
        
        // Prevent duplicate sends per year
        const alreadySent = await (this.prisma as any).marketingCampaign.findFirst({
          where: {
            customerId: customer.id,
            campaignType: 'BIRTHDAY',
            createdAt: { gte: new Date(today.getFullYear(), 0, 1) }
          }
        });

        if (alreadySent) continue;

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

  private async sendCampaignEmail(tenant: any, customer: any, settings: any, type: string) {
    try {
      const promoCodeStr = `${type}-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      await (this.prisma as any).promotion.create({
        data: {
          name: settings.name,
          type: settings.discountType as any,
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
        .replace(/{{discount_suffix}}/g, settings.discountType === 'PERCENTAGE_OFF' ? '%' : ' ' + (tenant as any).settings?.currency || 'USD');

      const subject = settings.emailSubject.replace(/{{customer_name}}/g, customer.name);

      await this.mailService.sendMail(customer.email, subject, emailHtml);

      await (this.prisma as any).marketingCampaign.create({
        data: {
          tenantId: tenant.id,
          customerId: customer.id,
          campaignType: type,
          status: 'SENT',
          metadata: { promoCode: promoCodeStr }
        }
      });
    } catch (err) {
      this.logger.error(`[${type}] Failed for customer ${customer.id}: ${err.message}`);
    }
  }

  async getCampaignRule(tenantId: string) {
    let rule = await (this.prisma as any).marketingCampaignRule.findUnique({
      where: { tenantId }
    });

    if (!rule) {
      rule = await (this.prisma as any).marketingCampaignRule.create({
        data: {
          tenantId,
          name: 'Marketing Engine',
          isActive: true,
        }
      });
    }
    return rule;
  }

  async updateCampaignRule(tenantId: string, data: any) {
    const { id, tenantId: _, createdAt, updatedAt, tenant, ...updateData } = data;

    // Type Normalization
    if (updateData.inactiveDays !== undefined) updateData.inactiveDays = Number(updateData.inactiveDays);
    if (updateData.discountValue !== undefined) updateData.discountValue = Number(updateData.discountValue);
    if (updateData.birthdayReward !== undefined) updateData.birthdayReward = Number(updateData.birthdayReward);
    if (updateData.referralReward !== undefined) updateData.referralReward = Number(updateData.referralReward);
    if (updateData.referralFriendReward !== undefined) updateData.referralFriendReward = Number(updateData.referralFriendReward);

    return (this.prisma as any).marketingCampaignRule.update({
      where: { tenantId },
      data: updateData
    });
  }

  async getCampaignStats(tenantId: string) {
    const campaigns = await (this.prisma as any).marketingCampaign.findMany({
      where: { tenantId, campaignType: 'WIN_BACK' },
      include: { customer: true },
      orderBy: { sentAt: 'desc' },
    });

    // 1. Get all redemptions for this tenant's win-back codes
    const redemptions = await (this.prisma as any).promoCodeRedemption.findMany({
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
    const totalRevenue = redemptions.reduce((sum: number, r: any) => sum + Number(r.order.totalAmount), 0);

    return {
      totalSent,
      totalConverted,
      conversionRate: conversionRate.toFixed(1) + '%',
      totalRevenue: totalRevenue.toFixed(2),
      recentCampaigns: campaigns.slice(0, 10),
    };
  }
}
