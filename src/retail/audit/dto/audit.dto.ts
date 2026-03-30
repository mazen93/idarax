import { IsString, IsOptional, IsNumber, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StartAuditDto {
    @ApiProperty({ example: 'warehouse-uuid' })
    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @ApiProperty({ type: [String], required: false, description: 'Optional list of product IDs to audit. If empty, all products in warehouse will be included.' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    productIds?: string[];
}

export class AuditItemUpdateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    physicalQuantity: number;
}

export class UpdateAuditDto {
    @ApiProperty({ type: [AuditItemUpdateDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AuditItemUpdateDto)
    items: AuditItemUpdateDto[];
}
