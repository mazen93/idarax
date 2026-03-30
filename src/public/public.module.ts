import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../order/order.module';

@Module({
    imports: [PrismaModule, OrderModule],
    controllers: [PublicController],
    providers: [PublicService],
})
export class PublicModule { }
