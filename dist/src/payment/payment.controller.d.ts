import { PaymentService } from './payment.service';
import { ProcessPaymentDto, PaymentStatusDto } from './dto/payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    process(dto: ProcessPaymentDto): Promise<any>;
    findByOrder(orderId: string): Promise<any>;
    updateStatus(id: string, dto: PaymentStatusDto): Promise<any>;
}
