import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BranchSettingsService } from './branch-settings.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { UpdateBranchSettingsDto } from './dto/branch-settings.dto';

@Controller('tenant/branches/:branchId/settings')
@UseGuards(JwtAuthGuard)
export class BranchSettingsController {
    constructor(private readonly branchSettingsService: BranchSettingsService) {}

    @Get()
    @Permissions(Actions.SETTINGS.VIEW)
    getByBranch(@Param('branchId') branchId: string) {
        return this.branchSettingsService.getByBranch(branchId);
    }

    @Put()
    @Permissions(Actions.SETTINGS.EDIT)
    upsert(
        @Param('branchId') branchId: string,
        @Body() dto: UpdateBranchSettingsDto
    ) {
        return this.branchSettingsService.upsert(branchId, dto);
    }
}
