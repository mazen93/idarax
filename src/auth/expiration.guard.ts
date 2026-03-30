import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ExpirationGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Expiration guard checks if the user's token is marked as expired
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.isExpired) {
            throw new ForbiddenException('Your subscription has expired. Please renew your plan to continue using the system.');
        }

        return true;
    }
}
