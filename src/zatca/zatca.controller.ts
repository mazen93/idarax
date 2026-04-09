import { Controller, Post, Body, UseGuards, Req, InternalServerErrorException, Patch } from '@nestjs/common';
import { ZatcaOnboardingService } from './zatca-onboarding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/zatca')
@UseGuards(JwtAuthGuard)
export class ZatcaController {
  constructor(
    private onboardingService: ZatcaOnboardingService,
    private prisma: PrismaService,
  ) {}

  /**
   * Updates ZATCA-specific settings
   */
  @Patch('settings')
  async updateSettings(@Req() req: any, @Body() dto: any) {
    const tenantId = req.user.tenantId;
    return (this.prisma as any).settings.update({
      where: { tenantId },
      data: {
        zatcaVatNumber: dto.vatNumber,
        zatcaSellerNameAr: dto.sellerNameAr,
        zatcaSellerNameEn: dto.sellerNameEn,
        zatcaPhase: dto.phase || 1,
      },
    });
  }

  /**
   * Triggers the initial device onboarding (Key generation & CSR)
   */
  @Post('onboard')
  async onboard(@Req() req: any) {
    try {
      const tenantId = req.user.tenantId;
      return await this.onboardingService.onboardDevice(tenantId);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /**
   * Completes onboarding by entering the OTP from ZATCA portal
   */
  @Post('complete-onboarding')
  async completeOnboarding(@Req() req: any, @Body('otp') otp: string) {
    try {
      const tenantId = req.user.tenantId;
      return await this.onboardingService.completeOnboarding(tenantId, otp);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
