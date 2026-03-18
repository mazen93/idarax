import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { ProcessPaymentDto, PaymentStatusDto } from './dto/payment.dto';
export declare class PaymentService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    processPayment(dto: ProcessPaymentDto): Promise<any>;
    getPaymentsByOrder(orderId: string): Promise<any>;
    updatePaymentStatus(id: string, dto: PaymentStatusDto): Promise<any>;
}
