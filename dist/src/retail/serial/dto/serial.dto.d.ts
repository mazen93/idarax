import { SerialStatus } from '@prisma/client';
export declare class RegisterSerialDto {
    serial: string;
    productId: string;
}
export declare class UpdateSerialStatusDto {
    status: SerialStatus;
}
