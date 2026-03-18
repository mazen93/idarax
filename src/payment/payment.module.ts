import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}
