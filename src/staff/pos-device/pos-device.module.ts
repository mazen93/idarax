import { Module } from '@nestjs/common';
import { PosDeviceService } from './pos-device.service';
import { PosDeviceController } from './pos-device.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    controllers: [PosDeviceController],
    providers: [PosDeviceService],
    exports: [PosDeviceService],
})
export class PosDeviceModule { }
