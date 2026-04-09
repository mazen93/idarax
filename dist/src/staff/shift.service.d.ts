import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { ClockInDto, ClockOutDto, StartBreakDto } from './dto/shift.dto';
export declare class ShiftService {
    private readonly prisma;
    private readonly tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    clockIn(userId: string, dto: ClockInDto): Promise<any>;
    getCurrentShift(userId: string): Promise<{
        shift: any;
        serverTime: Date;
    }>;
    clockOut(userId: string, dto: ClockOutDto): Promise<any>;
    startBreak(userId: string, dto: StartBreakDto): Promise<any>;
    endBreak(userId: string): Promise<any>;
    getAllShifts(from?: Date, to?: Date, branchId?: string): Promise<any>;
    hasOpenShift(tenantId: string, userId: string): Promise<boolean>;
}
