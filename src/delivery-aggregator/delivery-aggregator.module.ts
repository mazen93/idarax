import { Module } from '@nestjs/common';
import { DeliveryAggregatorService } from './delivery-aggregator.service';
import { DeliveryAggregatorController } from './delivery-aggregator.controller';
import { OrderModule } from '../order/order.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [OrderModule, PrismaModule],
  providers: [DeliveryAggregatorService],
  controllers: [DeliveryAggregatorController],
})
export class DeliveryAggregatorModule {}
