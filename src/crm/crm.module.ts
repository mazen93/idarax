import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { CrmSchedule } from './crm.schedule';
import { DrovoModule } from '../delivery-aggregator/drovo.module';

@Module({
  imports: [PrismaModule, TenantModule, DrovoModule],
  providers: [CrmService, CrmSchedule],
  controllers: [CrmController],
  exports: [CrmService]
})
export class CrmModule {}
