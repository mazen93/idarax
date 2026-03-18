import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { KdsService } from './kds.service';
import { KdsController } from './kds.controller';
import { KdsGateway } from './kds.gateway';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [KdsService, KdsGateway],
  controllers: [KdsController],
  exports: [KdsService, KdsGateway],
})
export class KdsModule { }
