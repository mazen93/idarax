import { Global, Module, forwardRef } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantModule } from '../tenant/tenant.module';

@Global()
@Module({
  imports: [forwardRef(() => TenantModule)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
