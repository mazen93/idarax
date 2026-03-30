import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
    @ApiProperty({ example: 'branch-uuid', required: false })
    @IsString()
    @IsOptional()
    branchId?: string;

    @ApiProperty({ description: 'PIN code for verification', example: '1234' })
    @IsString()
    @IsNotEmpty()
    pinCode: string;
}

export class CheckOutDto {
    @ApiProperty({ description: 'PIN code for verification', example: '1234' })
    @IsString()
    @IsNotEmpty()
    pinCode: string;
}
