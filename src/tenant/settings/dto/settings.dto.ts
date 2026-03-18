import { IsString, IsOptional, IsNumber, IsBoolean, IsDecimal, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    timezone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    taxRate?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    serviceFee?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    receiptHeader?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    receiptFooter?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowLogo?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowTable?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowCustomer?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowOrderNumber?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(8)
    @Max(24)
    receiptFontSize?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    receiptQrCodeUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    receiptLanguage?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowTimestamp?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowOrderType?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowOperator?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowItemsDescription?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowItemsQty?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowItemsPrice?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowSubtotal?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowTax?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowServiceCharge?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowDiscount?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowTotal?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowPaymentMethod?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    receiptShowBarcode?: boolean;
}
