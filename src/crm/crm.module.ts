import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [CrmService],
  controllers: [CrmController]
})
export class CrmModule {}
