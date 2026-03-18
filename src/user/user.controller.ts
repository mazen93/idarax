import { Controller, Get, Post, Body, Delete, Patch, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    create(@Body() dto: CreateUserDto) {
        return this.userService.create(dto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.userService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
