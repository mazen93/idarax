import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SubscriptionCronService {
    private readonly logger = new Logger(SubscriptionCronService.name);

    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkExpiringSubscriptions() {
        this.logger.log('Running daily subscription expiry check...');
        
        const now = new Date();
        const templates = [7, 3, 1]; // Reminder intervals in days

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
                    // Try to grab the owner or admin
                    users: {
                        orderBy: { createdAt: 'asc' },
                        take: 1
                    }
                }
            });

            for (const tenant of expiringTenants) {
                const owner = tenant.users[0];
                if (!owner?.email) continue;

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
                } catch (error) {
                    this.logger.error(`Failed to send expiry reminder to ${owner.email}`, error);
                }
            }
        }
    }
}
