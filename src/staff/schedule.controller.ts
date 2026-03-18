import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';
import { ScheduledShiftStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Staff Scheduling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('staff/schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @Post()
    @Permissions(Actions.STAFF_SCHEDULE.MANAGE)
    @ApiOperation({ summary: 'Create a new scheduled shift' })
    create(@Body() dto: { userId: string; branchId: string; startAt: string; endAt: string; status?: ScheduledShiftStatus }) {
        return this.scheduleService.create({
            ...dto,
            startAt: new Date(dto.startAt),
            endAt: new Date(dto.endAt),
        });
    }

    @Get()
    @Permissions(Actions.STAFF_SCHEDULE.VIEW)
    @ApiOperation({ summary: 'List all scheduled shifts within a date range' })
    findAll(
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('branchId') branchId?: string,
    ) {
        return this.scheduleService.findAll(new Date(start), new Date(end), branchId);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user\'s scheduled shifts' })
    findMe(
        @Query('start') start: string,
        @Query('end') end: string,
        @Body('userId') userId: string, // Injected by some interceptor or just use current user id
    ) {
        // Usually we get userId from Req but for now we follow the existing pattern
        return this.scheduleService.findByUser(userId, new Date(start), new Date(end));
    }

    @Put(':id')
    @Permissions(Actions.STAFF_SCHEDULE.MANAGE)
    @ApiOperation({ summary: 'Update a scheduled shift' })
    update(
        @Param('id') id: string,
        @Body() dto: { startAt?: string; endAt?: string; status?: ScheduledShiftStatus; branchId?: string },
    ) {
        return this.scheduleService.update(id, {
            ...dto,
            startAt: dto.startAt ? new Date(dto.startAt) : undefined,
            endAt: dto.endAt ? new Date(dto.endAt) : undefined,
        });
    }

    @Delete(':id')
    @Permissions(Actions.STAFF_SCHEDULE.MANAGE)
    @ApiOperation({ summary: 'Delete/Cancel a scheduled shift' })
    remove(@Param('id') id: string) {
        return this.scheduleService.remove(id);
    }
}
