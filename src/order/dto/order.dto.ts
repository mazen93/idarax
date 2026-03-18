import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemModifierDto {
    @ApiProperty()
    @IsString()
    optionId: string;
}

export class CreateOrderItemDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    variantId?: string;

    @ApiProperty()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    stationId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    courseName?: string;

    @ApiProperty({ type: [CreateOrderItemModifierDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemModifierDto)
    modifiers?: CreateOrderItemModifierDto[];
}

export enum OrderType {
    DINE_IN = 'DINE_IN',
    TAKEAWAY = 'TAKEAWAY',
    DELIVERY = 'DELIVERY',
    DRIVE_THRU = 'DRIVE_THRU',
    CURBSIDE = 'CURBSIDE',
    IN_STORE = 'IN_STORE',
}

export class CreateOrderDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tableId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiProperty({ type: [CreateOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    @ApiProperty()
    @IsNumber()
    totalAmount: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    offerCode?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    discountAmount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    taxAmount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    serviceFeeAmount?: number;

    @ApiProperty({ enum: OrderType, required: false })
    @IsOptional()
    @IsEnum(OrderType)
    orderType?: OrderType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    guestName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    guestPhone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    note?: string;

    // POS Specific fields
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    paidAmount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    paymentMethod?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    deliveryAddress?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    splitPayments?: { method: string, amount: number }[];
}

export class SplitBillDto {
    @ApiProperty()
    @IsString()
    orderId: string;

    @ApiProperty()
    @IsString()
    splitType: 'EQUAL' | 'BY_ITEM' | 'BY_AMOUNT';

    @ApiProperty()
    @IsArray()
    splits: {
        customerId: string;
        amount?: number;
        itemIds?: string[];
    }[];
}

export class RepeatOrderDto {
    @ApiProperty()
    @IsString()
    orderId: string;
}

export class SendReceiptDto {
    @ApiProperty()
    @IsString()
    email: string;
}
