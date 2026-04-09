import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsEmail } from 'class-validator';

export class UpsertLandingContentDto {
    @ApiProperty() @IsString() title: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() content?: string;
    @ApiProperty({ required: false }) @IsOptional() items?: any;
    @ApiProperty({ required: false }) @IsOptional() @IsString() theme?: string;
}

export class CreatePlanDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() nameAr?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionAr?: string;
    @ApiProperty() @IsNumber() price: number;
    @ApiProperty({ type: [String] }) @IsArray() features: string[];
    @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() featuresAr?: string[];
}

export class UpdatePlanDto {
    @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() nameAr?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() descriptionAr?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsNumber() price?: number;
    @ApiProperty({ required: false }) @IsOptional() @IsArray() features?: string[];
    @ApiProperty({ required: false }) @IsOptional() @IsArray() featuresAr?: string[];
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class SelfRegisterDto {
    @ApiProperty() @IsString() tenantName: string;
    @ApiProperty() @IsString() adminEmail: string;
    @ApiProperty() @IsString() adminPassword: string;
    @ApiProperty() @IsString() adminFirstName: string;
    @ApiProperty() @IsString() adminLastName: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() planId?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() type?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() country?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() countryCode?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() vatNumber?: string;
}

export class SubmitContactDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty() @IsEmail() email: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
    @ApiProperty() @IsString() message: string;
}
