import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Beverages' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'مشروبات', required: false })
    @IsOptional()
    @IsString()
    nameAr?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    descriptionAr?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    defaultStationId?: string;
}

export class UpdateCategoryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    nameAr?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    descriptionAr?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    defaultStationId?: string;
}
