import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum BreakType {
    LUNCH = 'LUNCH',
    SHORT = 'SHORT',
    OTHER = 'OTHER'
}

export class ClockInDto {
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

export class StartBreakDto {
    @ApiProperty({ enum: BreakType })
    @IsEnum(BreakType)
    type: BreakType;
}

export class ClockOutDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;
}
