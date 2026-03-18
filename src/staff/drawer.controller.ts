import { Controller, Post, Body, Get, Req, Param, Query, UseGuards } from '@nestjs/common';
import { DrawerService } from './drawer.service';
import { OpenDrawerDto, CloseDrawerDto, AddMovementDto } from './dto/drawer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Staff - Drawer')
@ApiBearerAuth()
@Controller('staff/drawer')
@UseGuards(JwtAuthGuard)
export class DrawerController {
    constructor(private readonly drawerService: DrawerService) { }

    @Post('open')
    @Permissions(Actions.CASH_DRAWER.OPEN)
    @ApiOperation({ summary: 'Open cash drawer session' })
    open(@Req() req: any, @Body() dto: OpenDrawerDto) {
        console.log('DEBUG: staff/drawer/open payload:', JSON.stringify(dto));
        return this.drawerService.openDrawer(req.user.id, dto);
    }

    @Post('close')
    @Permissions(Actions.CASH_DRAWER.CLOSE)
    @ApiOperation({ summary: 'Close cash drawer session with counted balance' })
    close(@Req() req: any, @Body() dto: CloseDrawerDto) {
        return this.drawerService.closeDrawer(req.user.id, dto);
    }

    @Post('movement')
    @Permissions(Actions.CASH_DRAWER.CASH_OUT) // Utilizing an existing action
    @ApiOperation({ summary: 'Record manual Cash In or Cash Out' })
    addMovement(@Req() req: any, @Body() dto: AddMovementDto) {
        return this.drawerService.addMovement(req.user.id, dto);
    }

    @Get('current')
    @Permissions(Actions.CASH_DRAWER.VIEW_SUMMARY)
    @ApiOperation({ summary: 'Get current open drawer session for logged-in user' })
    getCurrent(@Req() req: any) {
        return this.drawerService.getCurrentSession(req.user.id);
    }

    @Get('report/:id')
    @Permissions(Actions.CASH_DRAWER.VIEW_SUMMARY)
    @ApiOperation({ summary: 'Get Z-Report for a drawer session' })
    getReport(@Param('id') id: string) {
        return this.drawerService.getReport(id);
    }

    @Get('history')
    @Permissions(Actions.CASH_DRAWER.VIEW_SUMMARY)
    @ApiOperation({ summary: 'Admin: Get all drawer sessions' })
    getHistory(
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('branchId') branchId?: string,
    ) {
        return this.drawerService.getHistory(
            from ? new Date(from) : undefined,
            to ? new Date(to) : undefined,
            branchId,
        );
    }
}
