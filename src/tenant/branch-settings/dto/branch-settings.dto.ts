import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBranchSettingsDto {
    @ApiProperty({ required: false, example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ required: false, example: 15 })
    @IsOptional()
    @IsNumber()
    taxRate?: number;

    @ApiProperty({ required: false, example: 10 })
    @IsOptional()
    @IsNumber()
    serviceFee?: number;

    @ApiProperty({ required: false, example: 'Thank you for visiting!' })
    @IsOptional()
    @IsString()
    receiptHeader?: string;

    @ApiProperty({ required: false, example: 'Please come again.' })
    @IsOptional()
    @IsString()
    receiptFooter?: string;

    @ApiProperty({ required: false, example: 'en' })
    @IsOptional()
    @IsString()
    receiptLanguage?: string;

    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowCustomer?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowLogo?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowOrderNumber?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowTable?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowTimestamp?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowOrderType?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowOperator?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowItemsDescription?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowItemsQty?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowItemsPrice?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowSubtotal?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowTax?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowServiceCharge?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowDiscount?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowTotal?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowPaymentMethod?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() receiptShowBarcode?: boolean;

    // ─── Pre-Order Settings ───────────────────────────────────────────────────

    @ApiProperty({ required: false, description: 'Enable customers to schedule future orders from the web store', example: true })
    @IsOptional()
    @IsBoolean()
    preOrderEnabled?: boolean;

    @ApiProperty({ required: false, description: 'How many days ahead a customer can schedule (default 7)', example: 7 })
    @IsOptional()
    @IsNumber()
    preOrderMaxDaysAhead?: number;

    @ApiProperty({ required: false, description: 'Minutes before scheduled time the kitchen is notified (default 30)', example: 30 })
    @IsOptional()
    @IsNumber()
    preOrderLeadMinutes?: number;
}
