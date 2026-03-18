import { PrismaService } from '../prisma/prisma.service';
export declare class NumberingService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getBusinessDate(timezone: string, startHour?: number): string;
    nextReceiptNumber(tx: any, tenantId: string, branchId: string | null, timezone: string, startHour?: number): Promise<number>;
    nextInvoiceNumber(tx: any, tenantId: string, timezone: string, startHour?: number): Promise<string>;
}
