import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURES_KEY } from './subscription.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredFeature) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('Not authenticated');
        }

        if (user.isExpired && user.role !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Your subscription has expired. Please renew your plan to continue.');
        }

        const features = user.features || [];
        const hasFeature = features.includes(requiredFeature);

        if (!hasFeature) {
            throw new ForbiddenException(
                `Your current subscription plan does not include the '${requiredFeature}' feature. Please upgrade to access this.`
            );
        }

        return true;
    }
}
