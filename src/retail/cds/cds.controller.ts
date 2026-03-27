import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { PusherService } from '../../notifications/pusher.service';
import { AiService } from '../../analytics/ai/ai.service';
import { FeatureGateGuard, Feature } from '../../common/guards/feature-gate.guard';
import * as express from 'express';

@Controller('retail/cds')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGateGuard)
export class CdsController {
  constructor(
    private readonly pusherService: PusherService,
    private readonly aiService: AiService
  ) {}

  @Post('sync-cart')
  async syncCart(@Req() req: express.Request, @Body() data: any) {
    // The cashier app sends the full draft cart + subtotal/tax/total
    // Broadcast to the branch's specific CDS channel
    const branchId = (req.user as any)?.branchId || data.branchId;
    if (!branchId) {
      return { success: false, message: 'Branch ID is required for CDS sync' };
    }

    // Feature: Smart Upsell Engine
    let recommendations = [];
    const tenantId = (req.user as any)?.tenantId;
    
    // Check if user has UPSELL_ENGINE feature (handled by Guard for the endpoint, 
    // but we can also use it to conditionally fetch data)
    if (data.items && data.items.length > 0) {
      try {
        const productIds = data.items.map((item: any) => item.productId);
        recommendations = await this.aiService.getUpsellRecommendations(productIds);
      } catch (error) {
        // Fallback or ignore AI errors to keep the cart synced
      }
    }

    const channel = `private-cds-${branchId}`;
    
    // Fire event 'cds_cart_updated' to the CDS with recommendations
    await this.pusherService.trigger(channel, 'cds_cart_updated', {
      ...data,
      recommendations
    });

    return { success: true, message: 'Cart synced to CDS with AI suggestions' };
  }

  @Post('checkout')
  async checkoutState(@Req() req: express.Request, @Body() data: any) {
    const branchId = (req.user as any)?.branchId || data.branchId;
    if (!branchId) {
      return { success: false, message: 'Branch ID is required for CDS checkout' };
    }

    const channel = `private-cds-${branchId}`;
    
    // Fire event 'cds_checkout_started' or 'cds_checkout_completed'
    await this.pusherService.trigger(channel, 'cds_checkout_status', data);

    return { success: true, message: 'Checkout status synced to CDS' };
  }
}
