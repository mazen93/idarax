import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { SerialService } from './serial.service';
import { SerialController } from './serial.controller';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [SerialService],
  controllers: [SerialController]
})
export class SerialModule {}
