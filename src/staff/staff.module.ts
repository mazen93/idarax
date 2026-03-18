import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { DrawerService } from './drawer.service';
import { DrawerController } from './drawer.controller';
import { StaffPermissionsService } from './staff-permissions.service';
import { StaffPermissionsController } from './staff-permissions.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    providers: [ShiftService, DrawerService, StaffPermissionsService, ScheduleService],
    controllers: [ShiftController, DrawerController, StaffPermissionsController, ScheduleController],
    exports: [ShiftService, DrawerService, StaffPermissionsService, ScheduleService],
})
export class StaffModule { }
