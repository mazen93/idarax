import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { OrderService } from './order.service';

/**
 * Pre-Order Processor
 *
 * Listens on the `pre-orders` Bull queue for `fire-pre-order` jobs.
 * Each job is scheduled with a delay so it fires exactly (leadMinutes)
 * before the customer's requested scheduledAt time.
 *
 * The job transitions the order: SCHEDULED → PENDING  and notifies KDS.
 */
@Processor('pre-orders')
export class PreOrderProcessor {
    private readonly logger = new Logger(PreOrderProcessor.name);

    constructor(private readonly orderService: OrderService) {}

    @Process('fire-pre-order')
    async handleFirePreOrder(job: Job<{ orderId: string; tenantId: string; branchId?: string }>) {
        const { orderId } = job.data;
        this.logger.log(`[PreOrder] Firing pre-order ${orderId} to kitchen...`);

        try {
            const result = await this.orderService.firePreOrder(orderId);
            if (result) {
                this.logger.log(`[PreOrder] Successfully fired pre-order ${orderId}.`);
            } else {
                this.logger.warn(`[PreOrder] Pre-order ${orderId} was not SCHEDULED (may have been cancelled).`);
            }
        } catch (err) {
            this.logger.error(`[PreOrder] Failed to fire pre-order ${orderId}:`, err);
            throw err; // Rethrow so Bull retries
        }
    }
}
