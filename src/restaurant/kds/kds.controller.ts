import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { KdsService } from './kds.service';
import { CreateKitchenStationDto, UpdateOrderItemStatusDto, AssignStaffDto } from './dto/kds.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { RequiresFeature } from '../../auth/subscription.decorator';
import { SubscriptionGuard } from '../../auth/subscription.guard';

@Controller('restaurant/kds')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresFeature('KDS')
export class KdsController {
    constructor(private readonly kdsService: KdsService) { }

    @Post('stations')
    @Permissions(Actions.SETTINGS.EDIT) // Managing KDS stations is a setting
    createStation(@Body() dto: CreateKitchenStationDto) {
        return this.kdsService.createStation(dto);
    }

    @Get('stations')
    @Permissions(Actions.KDS.ACCESS)
    getStations() {
        return this.kdsService.getStations();
    }

    @Get('stations/:id/items')
    @Permissions(Actions.KDS.ACCESS)
    getStationItems(@Param('id') id: string) {
        return this.kdsService.getStationItems(id);
    }

    @Patch('items/:id/status')
    @Permissions(Actions.KDS.ACCESS)
    updateItemStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderItemStatusDto,
    ) {
        return this.kdsService.updateItemStatus(id, dto);
    }

    @Post('stations/:id/staff')
    @Permissions(Actions.SETTINGS.EDIT)
    assignStaff(@Param('id') id: string, @Body() dto: AssignStaffDto) {
        return this.kdsService.assignStaff(id, dto);
    }
}
