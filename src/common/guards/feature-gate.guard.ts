import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const CHECK_FEATURE = 'check_feature';
export const Feature = (feature: string) => SetMetadata(CHECK_FEATURE, feature);

@Injectable()
export class FeatureGateGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(CHECK_FEATURE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant context missing');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { plan: true },
    }) as any;

    if (!tenant || !tenant.plan) {
      throw new ForbiddenException('Tenant has no active subscription plan');
    }

    const hasFeature = (tenant.plan.features as string[]).includes(requiredFeature);

    if (!hasFeature) {
      throw new ForbiddenException(`The feature "${requiredFeature}" is not available on your current plan (${tenant.plan.name}). Please upgrade to Enterprise.`);
    }

    return true;
  }
}
