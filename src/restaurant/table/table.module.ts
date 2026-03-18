import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';

import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [TableService],
  controllers: [TableController]
})
export class TableModule { }
