import { ScheduleService } from './schedule.service';
import { ScheduledShiftStatus } from '@prisma/client';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    create(dto: {
        userId: string;
        branchId: string;
        startAt: string;
        endAt: string;
        status?: ScheduledShiftStatus;
    }): Promise<any>;
    findAll(start: string, end: string, branchId?: string): Promise<any>;
    findMe(start: string, end: string, userId: string): Promise<any>;
    update(id: string, dto: {
        startAt?: string;
        endAt?: string;
        status?: ScheduledShiftStatus;
        branchId?: string;
    }): Promise<any>;
    remove(id: string): Promise<any>;
}
