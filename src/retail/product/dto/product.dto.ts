import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVariantDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    costPrice?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    sku?: string;
}

export class UpdateVariantDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    costPrice?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    sku?: string;
}

export class CreateRecipeComponentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    ingredientId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    variantId?: string;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    quantity: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    unit?: string;
}

export class CreateModifierOptionDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    priceAdjust?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    sortOrder?: number;
}

export class CreateModifierGroupDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    required?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    multiSelect?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @ApiProperty({ type: [CreateModifierOptionDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateModifierOptionDto)
    options?: CreateModifierOptionDto[];
}

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

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

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    costPrice?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSellable?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiProperty({ enum: ['STANDARD', 'COMBO', 'RAW_MATERIAL'], required: false })
    @IsOptional()
    @IsEnum(['STANDARD', 'COMBO', 'RAW_MATERIAL'])
    productType?: 'STANDARD' | 'COMBO' | 'RAW_MATERIAL';

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ type: [CreateVariantDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateVariantDto)
    variants?: CreateVariantDto[];

    @ApiProperty({ type: [CreateRecipeComponentDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRecipeComponentDto)
    recipeComponents?: CreateRecipeComponentDto[];

    @ApiProperty({ type: [CreateModifierGroupDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateModifierGroupDto)
    modifiers?: CreateModifierGroupDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    defaultStationId?: string;

    @ApiProperty({ required: false, example: 'kg', description: 'Unit of measurement for raw material ingredients (kg, g, L, mL, slice, piece, unit)' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}

export class UpdateProductDto {
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
    @IsNumber()
    price?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    costPrice?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSellable?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiProperty({ enum: ['STANDARD', 'COMBO', 'RAW_MATERIAL'], required: false })
    @IsOptional()
    @IsEnum(['STANDARD', 'COMBO', 'RAW_MATERIAL'])
    productType?: 'STANDARD' | 'COMBO' | 'RAW_MATERIAL';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    categoryId?: string;

    @ApiProperty({ type: [UpdateVariantDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateVariantDto)
    variants?: UpdateVariantDto[];

    @ApiProperty({ type: [CreateRecipeComponentDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRecipeComponentDto)
    recipeComponents?: CreateRecipeComponentDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    defaultStationId?: string;

    @ApiProperty({ required: false, example: 'kg' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    imageUrl?: string;
}
