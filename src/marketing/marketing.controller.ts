import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureGateGuard, Feature } from '../common/guards/feature-gate.guard';

@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGateGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('win-back/trigger')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Feature('WIN_BACK_MARKETING')
  async triggerWinBack(@Request() req: any) {
    await this.marketingService.runWinBackCampaign(req.user.tenantId);
    return { status: 'success', message: 'Win-back campaign triggered' };
  }

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Feature('WIN_BACK_MARKETING')
  getStats(@Request() req: any) {
    return this.marketingService.getCampaignStats(req.user.tenantId);
  }

  @Get('rule')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Feature('WIN_BACK_MARKETING')
  getRule(@Request() req: any) {
    return this.marketingService.getCampaignRule(req.user.tenantId);
  }

  @Post('rule')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Feature('WIN_BACK_MARKETING')
  updateRule(@Request() req: any) {
    return this.marketingService.updateCampaignRule(req.user.tenantId, req.body);
  }
}
