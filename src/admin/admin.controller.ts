import { Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Superadmin Dashboard')
@Controller('superadmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Platform overview ──────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get('overview')
  @ApiOperation({ summary: 'Get platform-wide overview statistics (superadmin)' })
  getPlatformOverview() {
    return this.adminService.getPlatformOverview();
  }

  // ── Tenants ────────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get('tenants-detailed')
  @ApiOperation({ summary: 'Get tenants with advanced stats (superadmin)' })
  getTenantsDetailed() {
    return this.adminService.getTenantsWithStats();
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get('tenants')
  @ApiOperation({ summary: 'Get filtered/paginated tenant list (superadmin)' })
  @ApiQuery({ name: 'plan', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'TRIAL', 'EXPIRED'] })
  @ApiQuery({ name: 'countryCode', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getFilteredTenants(
    @Query('plan') plan?: string,
    @Query('status') status?: string,
    @Query('countryCode') countryCode?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getFilteredTenants({
      plan,
      status,
      countryCode,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  // ── Subscription analytics ─────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get('subscription-analytics')
  @ApiOperation({ summary: 'Get detailed subscription analytics (superadmin)' })
  getSubscriptionAnalytics() {
    return this.adminService.getSubscriptionAnalytics();
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get('country-analytics')
  @ApiOperation({ summary: 'Get geographical distribution analytics (superadmin)' })
  getCountryAnalytics() {
    return this.adminService.getCountryAnalytics();
  }

  // ── Plans ──────────────────────────────────────────────────────────────────
  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans (public)' })
  getAllPlans() {
    return this.adminService.getAllPlans();
  }

  // ── Upgrade requests ───────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get('upgrade-requests')
  @ApiOperation({ summary: 'Get upgrade requests (superadmin)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  getUpgradeRequests(@Query('status') status?: string) {
    return this.adminService.getUpgradeRequests(status);
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Put('upgrade-requests/:id/approve')
  @ApiOperation({ summary: 'Approve an upgrade request (superadmin)' })
  approveRequest(@Param('id') id: string) {
    return this.adminService.approveUpgradeRequest(id);
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Put('upgrade-requests/:id/reject')
  @ApiOperation({ summary: 'Reject an upgrade request (superadmin)' })
  rejectRequest(@Param('id') id: string, @Body() body: { note?: string }) {
    return this.adminService.rejectUpgradeRequest(id, body.note);
  }

  // ── Tenant subscription management ────────────────────────────────────────
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Put('tenants/:id/subscription')
  @ApiOperation({ summary: 'Update tenant subscription plan (superadmin)' })
  updateSubscription(
    @Param('id') id: string,
    @Body() dto: { planId: string; durationDays: number }
  ) {
    return this.adminService.updateTenantSubscription(id, dto.planId, dto.durationDays);
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Post('tenants/:id/extend-trial')
  @ApiOperation({ summary: 'Extend tenant trial period (superadmin)' })
  extendTrial(
    @Param('id') id: string,
    @Body() dto: { days: number }
  ) {
    return this.adminService.extendTrial(id, dto.days);
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Put('tenants/:id/approve')
  @ApiOperation({ summary: 'Activate/Approve a pending tenant (superadmin)' })
  approveTenant(@Param('id') id: string) {
    return this.adminService.approveTenant(id);
  }

  // ── Settings ───────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get('settings')
  @ApiOperation({ summary: 'Get global platform settings (superadmin)' })
  getSettings() {
    return this.adminService.getGlobalSettings();
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Put('settings/:key')
  @ApiOperation({ summary: 'Update a global platform setting (superadmin)' })
  updateSetting(
    @Param('key') key: string,
    @Body() dto: { value: any }
  ) {
    return this.adminService.updateGlobalSetting(key, dto.value);
  }

  // ── Audit logs ─────────────────────────────────────────────────────────────
  @Get('audit-logs')
  @ApiOperation({ summary: 'Get recent system audit logs (superadmin)' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}

// ── Tenant-facing controller ─────────────────────────────────────────────────
import { Controller as TenantCtrl } from '@nestjs/common';

@ApiTags('Tenant Subscription')
@TenantCtrl('tenant/subscription')
export class TenantSubscriptionController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get current tenant subscription info' })
  getMySubscription(@Req() req: any) {
    return this.adminService.getMySubscription(req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @Post('upgrade-request')
  @ApiOperation({ summary: 'Submit an upgrade request for current tenant' })
  requestUpgrade(@Req() req: any, @Body() dto: { planId: string }) {
    return this.adminService.createUpgradeRequest(req.user.tenantId, dto.planId);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List all available subscription plans (public)' })
  getPlans() {
    return this.adminService.getAllPlans();
  }
}
