import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TableSectionService } from './table-section.service';
import { CreateTableSectionDto, UpdateTableSectionDto } from './dto/table-section.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Permissions } from '../../../auth/permissions.decorator';
import { Actions } from '../../../auth/permissions.constants';

@Controller('restaurant/table-sections')
@UseGuards(JwtAuthGuard)
export class TableSectionController {
    constructor(private readonly sectionService: TableSectionService) { }

    @Post()
    @Permissions(Actions.TABLES.MANAGE)
    create(@Body() dto: CreateTableSectionDto) {
        return this.sectionService.create(dto);
    }

    @Get()
    @Permissions(Actions.TABLES.VIEW)
    findAll() {
        return this.sectionService.findAll();
    }

    @Get(':id')
    @Permissions(Actions.TABLES.VIEW)
    findOne(@Param('id') id: string) {
        return this.sectionService.findOne(id);
    }

    @Patch(':id')
    @Permissions(Actions.TABLES.MANAGE)
    update(@Param('id') id: string, @Body() dto: UpdateTableSectionDto) {
        return this.sectionService.update(id, dto);
    }

    @Delete(':id')
    @Permissions(Actions.TABLES.MANAGE)
    remove(@Param('id') id: string) {
        return this.sectionService.remove(id);
    }
}
