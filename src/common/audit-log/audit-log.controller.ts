import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit Log')
@ApiBearerAuth()
@Controller('analytics/audit-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('SETTINGS:VIEW')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get()
    @ApiOperation({ summary: 'Retrieve audit log entries for your tenant (managers only)' })
    findAll(
        @Request() req: any,
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('resourceType') resourceType?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.auditLogService.findAll(req.user.tenantId, {
            userId,
            action,
            resourceType,
            from,
            to,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50,
        });
    }
}
