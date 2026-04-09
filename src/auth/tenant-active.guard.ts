import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantActiveGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user (public route), allow access (let other guards handle auth if needed)
    if (!user) {
      return true;
    }

    // Super Admin is always allowed
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    if (!user.tenantId) {
      return true; // No tenant context (e.g. public routes)
    }

    // Check tenant status in DB
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { isActive: true, status: true },
    });

    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    if (!tenant.isActive) {
      const message = 
        tenant.status === 'PENDING' 
          ? 'Your account is pending Super Admin approval.' 
          : 'Your account has been suspended. Please contact support.';
      throw new ForbiddenException(message);
    }

    return true;
  }
}
