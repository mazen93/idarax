import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateTableDto {
    @IsNumber()
    number: number;

    @IsNumber()
    capacity: number;

    @IsString()
    @IsOptional()
    sectionId?: string;
}

export class UpdateTableDto {
    @IsNumber()
    @IsOptional()
    number?: number;

    @IsNumber()
    @IsOptional()
    capacity?: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    sectionId?: string;

    @IsBoolean()
    @IsOptional()
    isMerged?: boolean;

    @IsString()
    @IsOptional()
    parentTableId?: string;
}
