import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FeatureGateGuard, Feature } from '../../common/guards/feature-gate.guard';

@Controller('sync')
@UseGuards(JwtAuthGuard, FeatureGateGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('batch')
  @Feature('OFFLINE_RESILIENCE')
  async syncBatch(@Request() req: any, @Body() data: { orders: any[] }) {
    const tenantId = req.user.tenantId;
    const branchId = req.user.branchId || data.orders[0]?.branchId;
    
    return this.syncService.processSyncBatch(tenantId, branchId, data.orders);
  }
}
