import { Module } from '@nestjs/common';
import { CdsGateway } from './cds.gateway';
import { CdsService } from './cds.service';
import { CdsController } from './cds.controller';

@Module({
    providers: [CdsGateway, CdsService],
    controllers: [CdsController],
    exports: [CdsService, CdsGateway],
})
export class CdsModule { }
