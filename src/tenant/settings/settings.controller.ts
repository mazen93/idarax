import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('tenant/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @Permissions(Actions.SETTINGS.VIEW)
    get() {
        return this.settingsService.get();
    }

    @Patch()
    @Permissions(Actions.SETTINGS.EDIT)
    update(@Body() dto: UpdateSettingsDto) {
        return this.settingsService.update(dto);
    }
}
