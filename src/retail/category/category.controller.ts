import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { TenantCacheInterceptor } from '../../common/interceptors/tenant-cache.interceptor';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Retail Categories')
@ApiBearerAuth()
@Controller('retail/categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @Permissions(Actions.CATALOG.CREATE)
    create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    @Get()
    @Permissions(Actions.CATALOG.VIEW)
    @UseInterceptors(TenantCacheInterceptor)
    @CacheTTL(15000)
    findAll() {
        return this.categoryService.findAll();
    }

    @Patch(':id')
    @Permissions(Actions.CATALOG.EDIT)
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto);
    }

    @Delete(':id')
    @Permissions(Actions.CATALOG.DELETE)
    remove(@Param('id') id: string) {
        return this.categoryService.remove(id);
    }
}
