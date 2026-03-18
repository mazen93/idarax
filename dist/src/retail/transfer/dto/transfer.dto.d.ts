export declare class CreateTransferDto {
    sourceId: string;
    destinationId: string;
    productId: string;
    quantity: number;
}
export declare class UpdateTransferStatusDto {
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}
