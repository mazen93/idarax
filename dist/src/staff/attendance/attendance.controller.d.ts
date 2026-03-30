import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    checkIn(dto: CheckInDto): Promise<any>;
    checkOut(dto: CheckOutDto): Promise<any>;
    getSummary(userId: string, month: number, year: number): Promise<{
        userId: string;
        userName: any;
        month: number;
        year: number;
        attendances: any;
        totalHours: number;
        estimatedSalary: number | null;
        fixedSalary: number | null;
    }>;
    findAll(): Promise<any>;
}
