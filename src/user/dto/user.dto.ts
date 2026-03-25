import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
    KITCHEN_STAFF = 'KITCHEN_STAFF'
}

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty({ enum: UserRole, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    roleId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    pinCode?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    branchId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateUserDto {
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
    password?: string;

    @ApiProperty({ enum: UserRole, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    roleId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    pinCode?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    branchId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
