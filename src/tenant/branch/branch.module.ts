import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    controllers: [BranchController],
    providers: [BranchService],
    exports: [BranchService],
})
export class BranchModule { }
