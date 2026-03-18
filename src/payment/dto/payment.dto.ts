export class ProcessPaymentDto {
    orderId: string;
    amount: number;
    method: 'CASH' | 'CREDIT_CARD' | 'POINTS';
    reference?: string;
}

export class PaymentStatusDto {
    status: 'COMPLETED' | 'FAILED' | 'REFUNDED';
}
