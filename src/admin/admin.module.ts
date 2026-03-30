import { Module } from '@nestjs/common';
import { AdminController, TenantSubscriptionController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, TenantSubscriptionController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
