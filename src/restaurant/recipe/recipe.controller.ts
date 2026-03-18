import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('restaurant/recipes')
@UseGuards(JwtAuthGuard)
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) { }

    @Post()
    @Permissions(Actions.CATALOG.EDIT)
    create(@Body() dto: { parentId: string; ingredientId: string; quantity: number; unit?: string }) {
        return this.recipeService.create(dto);
    }

    @Get('product/:productId')
    @Permissions(Actions.CATALOG.VIEW)
    findByProduct(@Param('productId') productId: string) {
        return this.recipeService.findByProduct(productId);
    }

    @Delete(':id')
    @Permissions(Actions.CATALOG.EDIT)
    remove(@Param('id') id: string) {
        return this.recipeService.remove(id);
    }
}
