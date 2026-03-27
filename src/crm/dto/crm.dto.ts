import { IsString, IsEmail, IsOptional, IsBoolean, IsNumber, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class AddressDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    label?: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lng?: number;
}

export class CreateCustomerDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsEmail()
    email?: string;

    @ApiProperty()
    @IsString()
    phone: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    birthday?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    referredByCode?: string;

    @ApiProperty({ type: [AddressDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddressDto)
    addresses?: AddressDto[];
}

export class UpdateCustomerDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => value === "" ? undefined : value)
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Transform(({ value }) => value ? new Date(value) : undefined)
    birthday?: Date;

    @ApiProperty({ type: [AddressDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddressDto)
    addresses?: AddressDto[];
}

export class LoyaltyTransactionDto {
    @ApiProperty()
    @IsUUID()
    customerId: string;

    @ApiProperty()
    @IsNumber()
    points: number;

    @ApiProperty({ enum: ['EARNED', 'REDEEMED'] })
    @IsEnum(['EARNED', 'REDEEMED'])
    type: 'EARNED' | 'REDEEMED';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

export class CreateCustomerAddressDto {
    @ApiProperty()
    @IsUUID()
    customerId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    label?: string;

    @ApiProperty()
    @IsString()
    address: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lng?: number;
}

export class UpdateCustomerAddressDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    label?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lat?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    lng?: number;
}

export class PaginationQueryDto {
    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    limit?: number = 10;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    segmentId?: string;
}

export class CreateSegmentDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    color?: string;
}

export class UpdateSegmentDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    color?: string;
}

export class AssignCustomersDto {
    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    customerIds: string[];
}
