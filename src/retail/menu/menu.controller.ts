
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Retail Menus')
@ApiBearerAuth()
@Controller('retail/menus')
@UseGuards(JwtAuthGuard)
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Post()
    @Permissions(Actions.CATALOG.CREATE)
    create(@Body() dto: CreateMenuDto) {
        return this.menuService.create(dto);
    }

    @Get()
    @Permissions(Actions.CATALOG.VIEW)
    @ApiQuery({ name: 'branchId', required: false })
    findAll(@Query('branchId') branchId?: string) {
        return this.menuService.findAll(branchId);
    }

    @Get('active')
    @Permissions(Actions.CATALOG.VIEW)
    @ApiOperation({ summary: 'Get currently active menus based on current time and day' })
    @ApiQuery({ name: 'branchId', required: false })
    findActive(@Query('branchId') branchId?: string) {
        return this.menuService.findActive(branchId);
    }

    @Get(':id')
    @Permissions(Actions.CATALOG.VIEW)
    findOne(@Param('id') id: string) {
        return this.menuService.findOne(id);
    }

    @Patch(':id')
    @Permissions(Actions.CATALOG.EDIT)
    update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
        return this.menuService.update(id, dto);
    }

    @Delete(':id')
    @Permissions(Actions.CATALOG.DELETE)
    remove(@Param('id') id: string) {
        return this.menuService.remove(id);
    }
}
