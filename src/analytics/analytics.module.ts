import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { DashboardGateway } from './dashboard.gateway';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [AnalyticsService, DashboardGateway],
  controllers: [AnalyticsController],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
