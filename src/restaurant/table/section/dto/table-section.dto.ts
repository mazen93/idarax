import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTableSectionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    branchId?: string;
}

export class UpdateTableSectionDto {
    @IsString()
    @IsOptional()
    name?: string;
}
