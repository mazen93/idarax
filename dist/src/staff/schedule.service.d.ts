import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { ScheduledShiftStatus } from '@prisma/client';
export declare class ScheduleService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    create(dto: {
        userId: string;
        branchId: string;
        startAt: Date;
        endAt: Date;
        status?: ScheduledShiftStatus;
    }): Promise<any>;
    findAll(startDate: Date, endDate: Date, branchId?: string): Promise<any>;
    findByUser(userId: string, startDate: Date, endDate: Date): Promise<any>;
    update(id: string, dto: {
        startAt?: Date;
        endAt?: Date;
        status?: ScheduledShiftStatus;
        branchId?: string;
    }): Promise<any>;
    remove(id: string): Promise<any>;
}
