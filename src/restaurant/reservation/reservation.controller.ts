import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReservationService, WaitingService } from './reservation.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { RequiresFeature } from '../../auth/subscription.decorator';
import { SubscriptionGuard } from '../../auth/subscription.guard';

@Controller('restaurant/reservations')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresFeature('RESTAURANT')
export class ReservationController {
    constructor(private readonly service: ReservationService) { }

    @Post()
    @Permissions(Actions.TABLES.MANAGE)
    create(@Body() dto: any) { return this.service.create(dto); }

    @Get()
    @Permissions(Actions.TABLES.VIEW)
    findAll() { return this.service.findAll(); }

    @Patch(':id')
    @Permissions(Actions.TABLES.MANAGE)
    update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

    @Delete(':id')
    @Permissions(Actions.TABLES.MANAGE)
    remove(@Param('id') id: string) { return this.service.remove(id); }
}

@Controller('restaurant/waiting')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresFeature('RESTAURANT')
export class WaitingController {
    constructor(private readonly service: WaitingService) { }

    @Post()
    @Permissions(Actions.TABLES.MANAGE)
    create(@Body() dto: any) { return this.service.create(dto); }

    @Get()
    @Permissions(Actions.TABLES.VIEW)
    findAll() { return this.service.findAll(); }

    @Patch(':id')
    @Permissions(Actions.TABLES.MANAGE)
    update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

    @Delete(':id')
    @Permissions(Actions.TABLES.MANAGE)
    remove(@Param('id') id: string) { return this.service.remove(id); }
}
