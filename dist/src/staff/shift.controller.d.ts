import { ShiftService } from './shift.service';
import { ClockInDto, ClockOutDto, StartBreakDto } from './dto/shift.dto';
export declare class ShiftController {
    private readonly shiftService;
    constructor(shiftService: ShiftService);
    clockIn(req: any, dto: ClockInDto): Promise<any>;
    clockOut(req: any, dto: ClockOutDto): Promise<any>;
    startBreak(req: any, dto: StartBreakDto): Promise<any>;
    endBreak(req: any): Promise<any>;
    getCurrent(req: any): Promise<{
        shift: any;
        serverTime: Date;
    }>;
    getAll(from?: string, to?: string, branchId?: string): Promise<any>;
}
