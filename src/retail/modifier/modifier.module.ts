import { Module } from '@nestjs/common';
import { ModifierController } from './modifier.controller';
import { ModifierService } from './modifier.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    controllers: [ModifierController],
    providers: [ModifierService],
    exports: [ModifierService],
})
export class ModifierModule { }
