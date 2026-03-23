import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { KdsModule } from '../../restaurant/kds/kds.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [PrismaModule, TenantModule, KdsModule, NotificationsModule],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule { }
