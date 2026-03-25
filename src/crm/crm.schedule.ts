import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmSchedule {
    private readonly logger = new Logger(CrmSchedule.name);

    constructor(private prisma: PrismaService) {}

    /**
     * Daily Cron Job at 9:00 AM
     * Finds "Slipping" customers (last order 30-90 days ago) and sends them an automated campaign
     */
    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async handleSlippingCustomerCampaigns() {
        this.logger.debug('Running Slipping Customer Automation...');

        const now = new Date();
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(now.getDate() - 30);
        const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(now.getDate() - 90);

        // Find customers whose last order was between 30 and 90 days ago
        const slippingCustomers = await (this.prisma as any).customer.findMany({
            where: {
                orders: {
                    some: {}, // Must have at least one order
                    none: {
                        createdAt: { gte: thirtyDaysAgo } // No orders in last 30 days
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
            // Check if their most recent order is within the 90 day boundary
            // We only want customers whose last order was exactly between 30-90 days
            const lastOrderDate = new Date(customer.orders[0].createdAt);
            if (lastOrderDate < ninetyDaysAgo) {
                continue; // They are inactive (>90 days), ignore for this campaign
            }

            // Check if we already sent them a SLIPPING_REENGAGEMENT in the last 30 days
            const recentCampaign = await (this.prisma as any).marketingCampaign.findFirst({
                where: {
                    customerId: customer.id,
                    campaignType: 'SLIPPING_REENGAGEMENT',
                    sentAt: { gte: thirtyDaysAgo }
                }
            });

            if (recentCampaign) {
                continue; // Already processed recently
            }

            // Trigger "Send Campaign" logic here
            const discountCode = `WE_MISS_YOU_10`;
            this.logger.log(`[CRM_AUTOMATION] Sending 10% discount (${discountCode}) to customer ${customer.name} (Tenant: ${customer.tenantId})`);

            // Record in database
            await (this.prisma as any).marketingCampaign.create({
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
}
