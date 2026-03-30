import { PrismaService } from '../prisma/prisma.service';
export declare class InvoiceService {
    private prisma;
    constructor(prisma: PrismaService);
    generateInvoicePdf(orderId: string): Promise<Buffer>;
}
