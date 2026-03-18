export declare class ProcessPaymentDto {
    orderId: string;
    amount: number;
    method: 'CASH' | 'CREDIT_CARD' | 'POINTS';
    reference?: string;
}
export declare class PaymentStatusDto {
    status: 'COMPLETED' | 'FAILED' | 'REFUNDED';
}
