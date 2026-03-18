import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'password123' })
    password: string;

    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiProperty({ example: 'tenant-123' })
    tenantId: string;

    @ApiProperty({ required: false, example: 'STAFF' })
    role?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'admin@idarax.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    password: string;
}

export class PinLoginDto {
    @ApiProperty({ example: '1234' })
    @IsString()
    pin: string;

    @ApiProperty({ example: 'tenant-id' })
    @IsString()
    tenantId: string;
}

export class RefreshTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @IsString()
    refreshToken: string;
}

export class VerifyOverrideDto {
    @ApiProperty({ example: '1234' })
    @IsString()
    pin: string;

    @ApiProperty({ example: 'tenant-id' })
    @IsString()
    tenantId: string;

    @ApiProperty({ example: 'ORDERS:REFUND' })
    @IsString()
    action: string;
}
