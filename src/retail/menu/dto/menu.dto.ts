
import { IsString, IsArray, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    nameAr?: string;

    @ApiProperty({ example: '08:00' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    startTime: string;

    @ApiProperty({ example: '12:00' })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    endTime: string;

    @ApiProperty({ example: [0, 1, 2, 3, 4, 5, 6] })
    @IsArray()
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(6, { each: true })
    daysOfWeek: number[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    branchId?: string;

    @ApiProperty({ example: ['category-uuid-1'] })
    @IsArray()
    @IsString({ each: true })
    categoryIds: string[];
}

export class UpdateMenuDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    nameAr?: string;

    @ApiProperty({ example: '08:00', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    startTime?: string;

    @ApiProperty({ example: '12:00', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    endTime?: string;

    @ApiProperty({ example: [0, 1, 2, 3, 4, 5, 6], required: false })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Min(0, { each: true })
    @Max(6, { each: true })
    daysOfWeek?: number[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categoryIds?: string[];
}
