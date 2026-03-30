import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { MailModule } from '../mail/mail.module';
import { ReportingService } from './reporting.service';
import { ReportingCronService } from './reporting-cron.service';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [AnalyticsModule, MailModule, TenantModule],
  providers: [ReportingService, ReportingCronService],
  exports: [ReportingService],
})
export class ReportingModule {}
