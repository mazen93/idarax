import { IsString, IsOptional, IsNumber, IsNotEmpty, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreatePurchaseOrderItemDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    quantity: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    costPrice: number;
}

export class CreatePurchaseOrderDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    vendorId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    warehouseId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    branchId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({ type: [CreatePurchaseOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseOrderItemDto)
    items: CreatePurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {}

export class UpdatePurchaseOrderStatusDto {
    @ApiProperty({ enum: ['PENDING', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'] })
    @IsEnum(['PENDING', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'])
    status: 'PENDING' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    receivedItems?: { productId: string; quantity: number }[];
}
