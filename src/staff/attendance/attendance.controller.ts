import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('check-in')
    @ApiOperation({ summary: 'Clock-in for a shift using PIN code' })
    async checkIn(@Body() dto: CheckInDto) {
        return this.attendanceService.checkIn(dto);
    }

    @Post('check-out')
    @ApiOperation({ summary: 'Clock-out of a shift using PIN code' })
    async checkOut(@Body() dto: CheckOutDto) {
        return this.attendanceService.checkOut(dto);
    }

    @Get('summary')
    @Permissions(Actions.ATTENDANCE.VIEW)
    @ApiOperation({ summary: 'Get monthly attendance and payroll summary for a user' })
    async getSummary(
        @Query('userId') userId: string,
        @Query('month') month: number,
        @Query('year') year: number
    ) {
        return this.attendanceService.getMonthlyAttendance(userId, Number(month), Number(year));
    }

    @Get('all')
    @Permissions(Actions.ATTENDANCE.MANAGE)
    @ApiOperation({ summary: 'Get all attendance records (Admin only)' })
    async findAll() {
        return this.attendanceService.findAll();
    }
}
