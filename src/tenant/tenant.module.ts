import { Global, Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantService } from './tenant.service';
import { TenantAdminController } from './tenant.controller';
import { BranchSettingsService } from './branch-settings/branch-settings.service';
import { BranchSettingsController } from './branch-settings/branch-settings.controller';
import { SubscriptionCronService } from './subscription.cron';

@Global()
@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [TenantService, BranchSettingsService, SubscriptionCronService],
  controllers: [TenantAdminController, BranchSettingsController],
  exports: [TenantService, BranchSettingsService],
})
export class TenantModule { }
