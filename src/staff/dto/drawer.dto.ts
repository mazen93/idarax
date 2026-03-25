import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';

export class OpenDrawerDto {
    @ApiProperty({ description: 'Starting cash balance in drawer' })
    @IsNumber()
    @IsPositive()
    openingBalance: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => {
        if (!value || value === '' || value === 'null' || value === 'undefined') return undefined;
        return value;
    })
    @IsString()
    branchId?: string;
}

export class CloseDrawerDto {
    @ApiProperty({ description: 'Physically counted cash balance at close' })
    @IsNumber()
    closingBalance: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;
}

export enum CashMovementType {
    CASH_IN = 'CASH_IN',
    CASH_OUT = 'CASH_OUT',
    SALE = 'SALE',
    REFUND = 'REFUND',
}

export class AddMovementDto {
    @ApiProperty({ description: 'Positive amount only — direction controlled by type' })
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty({ enum: CashMovementType })
    @IsEnum(CashMovementType)
    type: CashMovementType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    referenceId?: string;
}
