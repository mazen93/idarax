import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional, IsBoolean, IsDateString, ValidateNested, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePublicOrderItemModifierDto {
    @IsString()
    @IsNotEmpty()
    optionId: string;
}

export class PublicOrderItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsOptional()
    variantId?: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreatePublicOrderItemModifierDto)
    modifiers?: CreatePublicOrderItemModifierDto[];
}

export class CreatePublicOrderDto {
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsString()
    @IsOptional()
    customerPhone?: string;

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @IsString()
    @IsOptional()
    orderType?: string; // PICKUP, DELIVERY, DINE_IN

    @IsString()
    @IsOptional()
    deliveryType?: string; // Alternative from frontend

    @IsString()
    @IsOptional()
    tableId?: string;

    @IsString()
    @IsOptional()
    tableNumber?: string; // Alternative from frontend

    @IsString()
    @IsOptional()
    branchId?: string;

    @IsString()
    @IsOptional()
    source?: string;
    
    @IsString()
    @IsOptional()
    note?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PublicOrderItemDto)
    items: PublicOrderItemDto[];

    @IsString()
    @IsOptional()
    scheduledAt?: string;

    @IsBoolean()
    @IsOptional()
    isPreOrder?: boolean;
}
