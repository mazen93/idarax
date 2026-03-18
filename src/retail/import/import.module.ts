import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    controllers: [ImportController],
    providers: [ImportService],
})
export class ImportModule { }
