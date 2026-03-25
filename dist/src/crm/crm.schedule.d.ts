import { PrismaService } from '../prisma/prisma.service';
export declare class CrmSchedule {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleSlippingCustomerCampaigns(): Promise<void>;
}
