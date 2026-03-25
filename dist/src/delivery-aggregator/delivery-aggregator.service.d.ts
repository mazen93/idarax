import { OrderService } from '../order/order.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class DeliveryAggregatorService {
    private orderService;
    private prisma;
    constructor(orderService: OrderService, prisma: PrismaService);
    handleWebhook(platform: string, payload: any): Promise<any>;
}
