import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchController {
    constructor(private readonly branchService: BranchService) { }

    @Get()
    @Permissions(Actions.SETTINGS.VIEW)
    findAll() {
        return this.branchService.findAll();
    }

    @Get(':id')
    @Permissions(Actions.SETTINGS.VIEW)
    findOne(@Param('id') id: string) {
        return this.branchService.findOne(id);
    }

    @Post()
    @Permissions(Actions.SETTINGS.EDIT)
    create(@Body() dto: CreateBranchDto) {
        return this.branchService.create(dto);
    }

    @Patch(':id')
    @Permissions(Actions.SETTINGS.EDIT)
    update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
        return this.branchService.update(id, dto);
    }

    @Delete(':id')
    @Permissions(Actions.SETTINGS.EDIT)
    remove(@Param('id') id: string) {
        return this.branchService.remove(id);
    }
}
