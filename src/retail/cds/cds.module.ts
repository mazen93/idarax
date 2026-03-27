import { Module } from '@nestjs/common';
import { CdsController } from './cds.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AiModule } from '../../analytics/ai/ai.module';

@Module({
  imports: [PrismaModule, NotificationsModule, AiModule],
  controllers: [CdsController],
})
export class CdsModule {}
