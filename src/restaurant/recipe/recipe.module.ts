import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    providers: [RecipeService],
    controllers: [RecipeController],
    exports: [RecipeService],
})
export class RecipeModule { }
