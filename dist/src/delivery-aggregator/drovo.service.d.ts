import { PrismaService } from '../prisma/prisma.service';
export declare class DrovoService {
    private prisma;
    private readonly logger;
    private readonly drovoApiUrl;
    constructor(prisma: PrismaService);
    dispatchOrder(orderId: string, tenantId: string): Promise<any>;
    getDeliveryFeeEstimate(tenantId: string, address: string, lat?: number, lng?: number): Promise<any>;
}
