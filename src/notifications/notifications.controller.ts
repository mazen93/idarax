import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { MarkReadDto } from './dto/notifications.dto';
import { TenantService } from '../tenant/tenant.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly tenantService: TenantService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all notifications for the current tenant' })
  findAll(@Request() req: any) {
    const tenantId = this.tenantService.getTenantId();
    const branchId = this.tenantService.getBranchId();
    return this.notificationsService.findAll(tenantId!, branchId ?? undefined);
  }

  @Patch('read')
  @ApiOperation({ summary: 'Mark specific notifications as read' })
  markRead(@Body() dto: MarkReadDto) {
    const tenantId = this.tenantService.getTenantId();
    return this.notificationsService.markRead(tenantId!, dto.ids);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead() {
    const tenantId = this.tenantService.getTenantId();
    return this.notificationsService.markAllRead(tenantId!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string) {
    const tenantId = this.tenantService.getTenantId();
    return this.notificationsService.remove(tenantId!, id);
  }
}
