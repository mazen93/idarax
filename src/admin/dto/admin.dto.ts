import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    features: string[];

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxPos?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(0)
    maxKds?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxBranches?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxUsers?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    nameAr?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    descriptionAr?: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    featuresAr?: string[];
}

export class UpdatePlanDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    features?: string[];

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxPos?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(0)
    maxKds?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxBranches?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxUsers?: number;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    nameAr?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    descriptionAr?: string;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    featuresAr?: string[];
}

export class TenantLimitOverrideDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxPos?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(0)
    maxKds?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxBranches?: number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    @Min(1)
    maxUsers?: number;

    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty()
    @IsString()
    @IsOptional()
    status?: string; // PENDING | ACTIVE | SUSPENDED
}
