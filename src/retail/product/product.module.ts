import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule { }
