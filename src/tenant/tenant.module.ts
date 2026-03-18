import { Global, Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantService } from './tenant.service';
import { TenantAdminController } from './tenant.controller';

@Global()
@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [TenantService],
  controllers: [TenantAdminController],
  exports: [TenantService],
})
export class TenantModule { }
