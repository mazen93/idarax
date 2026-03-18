import {
    Controller,
    Get,
    Put,
    Body,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { StaffPermissionsService } from './staff-permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Staff Permissions')
@ApiBearerAuth()
@Controller('staff/permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class StaffPermissionsController {
    constructor(private readonly service: StaffPermissionsService) { }

    @Get('users')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'List all users with their current permissions' })
    async getUsers(@Req() req: any) {
        return this.service.getAllUsersWithPermissions(req.user.tenantId);
    }

    @Get('users/:id')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'Get permissions for a specific user' })
    async getUserPermissions(@Param('id') id: string) {
        return this.service.getUserPermissions(id);
    }

    @Put('users/:id')
    @Permissions(Actions.STAFF_MANAGEMENT.ASSIGN_ROLES)
    @ApiOperation({ summary: 'Set permissions for a specific user' })
    async setPermissions(
        @Param('id') id: string,
        @Req() req: any,
        @Body() dto: { actions: string[] },
    ) {
        return this.service.setPermissions(id, req.user.tenantId, dto.actions);
    }

    @Get('roles/defaults')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'Get default permissions mapping for each role' })
    getRoleDefaults() {
        return this.service.getRoleDefaults();
    }

    @Get('actions')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'Get all available actions' })
    getAvailableActions() {
        return this.service.getAvailableActions();
    }
}
