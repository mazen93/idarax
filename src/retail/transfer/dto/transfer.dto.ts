export class CreateTransferDto {
    sourceId: string;
    destinationId: string;
    productId: string;
    quantity: number;
}

export class UpdateTransferStatusDto {
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}
