import { Module } from '@nestjs/common';
import { ReservationService, WaitingService } from './reservation.service';
import { ReservationController, WaitingController } from './reservation.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    providers: [ReservationService, WaitingService],
    controllers: [ReservationController, WaitingController],
})
export class ReservationModule { }
