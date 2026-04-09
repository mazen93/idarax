import { IsString, IsEnum, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  ORDER_READY = 'ORDER_READY',
  LOW_STOCK = 'LOW_STOCK',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  ORDER_VOIDED = 'ORDER_VOIDED',
  MANAGER_ALERT = 'MANAGER_ALERT',
  PRE_ORDER_RECEIVED = 'PRE_ORDER_RECEIVED',
  PRE_ORDER_FIRED = 'PRE_ORDER_FIRED',
}

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class MarkReadDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
