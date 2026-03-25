import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DrovoService } from './drovo.service';
import { DrovoController } from './drovo.controller';

@Module({
    imports: [PrismaModule],
    providers: [DrovoService],
    controllers: [DrovoController],
    exports: [DrovoService],
})
export class DrovoModule {}
