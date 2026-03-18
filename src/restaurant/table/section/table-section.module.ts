import { Module } from '@nestjs/common';
import { TableSectionService } from './table-section.service';
import { TableSectionController } from './table-section.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { TenantModule } from '../../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    controllers: [TableSectionController],
    providers: [TableSectionService],
    exports: [TableSectionService],
})
export class TableSectionModule { }
