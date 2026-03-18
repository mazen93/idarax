import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions(Actions.STAFF_MANAGEMENT.CREATE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Permissions(Actions.STAFF_MANAGEMENT.VIEW)
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @Permissions(Actions.STAFF_MANAGEMENT.EDIT)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Permissions(Actions.STAFF_MANAGEMENT.DELETE)
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
