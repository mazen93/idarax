import { IsString, IsOptional, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
    @ApiProperty({ example: 'Almarai' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: false, example: 'vendor@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false, example: '+966500000000' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false, example: 'Riyadh, KSA' })
    @IsOptional()
    @IsString()
    address?: string;
}

export class UpdateVendorDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;
}

export class LinkProductDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty()
    @IsNumber()
    costPrice: number;
}
