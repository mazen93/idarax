import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    sourceId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    destinationId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    quantity: number;
}

export class UpdateTransferStatusDto {
    @ApiProperty({ enum: ['PENDING', 'COMPLETED', 'CANCELLED'] })
    @IsEnum(['PENDING', 'COMPLETED', 'CANCELLED'])
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}
