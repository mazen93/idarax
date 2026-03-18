import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateKitchenStationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    staffIds?: string[];
}

export class CreateOrderItemDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    price: number;

    @IsString()
    @IsOptional()
    stationId?: string;
}

export class UpdateOrderItemStatusDto {
    @IsEnum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'])
    status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

    @IsString()
    @IsOptional()
    staff_pin?: string;
}

export class AssignStaffDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    staffIds: string[];
}
