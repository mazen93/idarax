import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertBranchProductDto {
    @IsBoolean()
    isAvailable: boolean;

    @IsOptional()
    @IsNumber()
    priceOverride?: number | null;

    @IsOptional()
    @IsString()
    defaultStationId?: string | null;
}
