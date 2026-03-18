import { Controller, Post, Body, Get, Req, UseGuards, Query } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ClockInDto, ClockOutDto, StartBreakDto } from './dto/shift.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Staff')
@ApiBearerAuth()
@Controller('staff/shifts')
@UseGuards(JwtAuthGuard)
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) { }

    @Post('clock-in')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW) // Usually general access, view is least privileged
    @ApiOperation({ summary: 'Staff clock in' })
    clockIn(@Req() req: any, @Body() dto: ClockInDto) {
        return this.shiftService.clockIn(req.user.id, dto);
    }

    @Post('clock-out')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'Staff clock out' })
    clockOut(@Req() req: any, @Body() dto: ClockOutDto) {
        return this.shiftService.clockOut(req.user.id, dto);
    }

    @Post('break/start')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'Start a break' })
    startBreak(@Req() req: any, @Body() dto: StartBreakDto) {
        return this.shiftService.startBreak(req.user.id, dto);
    }

    @Post('break/end')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'End a break' })
    endBreak(@Req() req: any) {
        return this.shiftService.endBreak(req.user.id);
    }

    @Get('current')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'Get current active shift for logged in user' })
    getCurrent(@Req() req: any) {
        return this.shiftService.getCurrentShift(req.user.id);
    }

    @Get('all')
    @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
    @ApiOperation({ summary: 'Admin: Get all shifts for the tenant' })
    getAll(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('branchId') branchId?: string,
    ) {
        return this.shiftService.getAllShifts(
            from ? new Date(from) : undefined,
            to ? new Date(to) : undefined,
            branchId,
        );
    }
}
