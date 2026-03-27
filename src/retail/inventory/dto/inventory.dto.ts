import { IsString, IsOptional, IsNumber, IsNotEmpty, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MovementType } from '@prisma/client';

export class CreateWarehouseDto {
    @ApiProperty({ example: 'Main Warehouse' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false, example: 'Riyadh Zone 1' })
    @IsOptional()
    @IsString()
    location?: string;
}

export class AdjustStockDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    quantity: number;

    @ApiProperty({ enum: ['ADD', 'REMOVE', 'SET', 'RESTOCK', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'SALE'] })
    @IsEnum(['ADD', 'REMOVE', 'SET', 'RESTOCK', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'SALE'])
    type: 'ADD' | 'REMOVE' | 'SET' | 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE' | 'RETURN' | 'SALE';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    referenceId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class StocktakeItemDto {
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

export class StocktakeDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    warehouseId: string;

    @ApiProperty({ type: [StocktakeItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StocktakeItemDto)
    items: StocktakeItemDto[];
}

export class WarehouseQueryDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    tenantId?: string;
}
