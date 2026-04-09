import type { Job } from 'bull';
import { OrderService } from './order.service';
export declare class PreOrderProcessor {
    private readonly orderService;
    private readonly logger;
    constructor(orderService: OrderService);
    handleFirePreOrder(job: Job<{
        orderId: string;
        tenantId: string;
        branchId?: string;
    }>): Promise<void>;
}
