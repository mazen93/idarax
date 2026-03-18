import { SerialStatus } from '@prisma/client';

export class RegisterSerialDto {
    serial: string;
    productId: string;
}

export class UpdateSerialStatusDto {
    status: SerialStatus;
}
