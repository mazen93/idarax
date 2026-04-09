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
    slug?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    customDomain?: string;

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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    drovoTenantId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    drovoApiKey?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    loyaltyRatioEarning?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    loyaltyRatioRedemption?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    preOrderEnabled?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(365)
    preOrderMaxDaysAhead?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1440)
    preOrderLeadMinutes?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    zatcaVatNumber?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    zatcaSellerNameAr?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    zatcaSellerNameEn?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    zatcaPhase?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    zatcaIsOnboarded?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    requireOpenShift?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    requireOpenDrawer?: boolean;
}
