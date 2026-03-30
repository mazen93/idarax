import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';
export declare class AttendanceService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    checkIn(dto: CheckInDto): Promise<any>;
    checkOut(dto: CheckOutDto): Promise<any>;
    getMonthlyAttendance(userId: string, month: number, year: number): Promise<{
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
