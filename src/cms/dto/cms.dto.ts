import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class UpsertLandingContentDto {
    @ApiProperty() @IsString() title: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() content?: string;
    @ApiProperty({ required: false }) @IsOptional() items?: any;
}

export class CreatePlanDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty() @IsNumber() price: number;
    @ApiProperty({ type: [String] }) @IsArray() features: string[];
}

export class UpdatePlanDto {
    @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsNumber() price?: number;
    @ApiProperty({ required: false }) @IsOptional() @IsArray() features?: string[];
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class SelfRegisterDto {
    @ApiProperty() @IsString() tenantName: string;
    @ApiProperty() @IsString() adminEmail: string;
    @ApiProperty() @IsString() adminPassword: string;
    @ApiProperty() @IsString() adminFirstName: string;
    @ApiProperty() @IsString() adminLastName: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() planId?: string;
}
