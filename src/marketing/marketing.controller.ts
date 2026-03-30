import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequiresFeature } from '../auth/subscription.decorator';
import { SubscriptionGuard } from '../auth/subscription.guard';

@Controller('marketing')
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@RequiresFeature('MARKETING')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post('win-back/trigger')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async triggerWinBack(@Request() req: any) {
    await this.marketingService.runWinBackCampaign(req.user.tenantId);
    return { status: 'success', message: 'Win-back campaign triggered' };
  }

  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getStats(@Request() req: any) {
    return this.marketingService.getCampaignStats(req.user.tenantId);
  }

  @Get('rule')
  @Roles('ADMIN', 'SUPER_ADMIN')
  getRule(@Request() req: any) {
    return this.marketingService.getCampaignRule(req.user.tenantId);
  }

  @Post('rule')
  @Roles('ADMIN', 'SUPER_ADMIN')
  updateRule(@Request() req: any) {
    return this.marketingService.updateCampaignRule(req.user.tenantId, req.body);
  }
}
