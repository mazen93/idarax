import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional, ValidateNested, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PublicOrderItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;
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
    tableId?: string;

    @IsString()
    @IsOptional()
    branchId?: string;

    @IsString()
    @IsOptional()
    orderType?: string; // PICKUP, DELIVERY, DINE_IN

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PublicOrderItemDto)
    items: PublicOrderItemDto[];
}
