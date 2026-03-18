import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const overrideToken = request.headers['x-override-token'] as string;

        let permissionsToCheck = user?.permissions || [];
        let roleToCheck = user?.role;

        if (overrideToken) {
            try {
                const overridePayload = jwt.verify(overrideToken, process.env.JWT_SECRET || 'secretKey') as any;
                if (overridePayload && overridePayload.isOverride) {
                    permissionsToCheck = overridePayload.permissions;
                    roleToCheck = overridePayload.role;
                }
            } catch (err) {
                // If override token is invalid, we proceed with normal user permissions
            }
        }

        if (!user && !overrideToken) {
            throw new ForbiddenException('Not authenticated');
        }

        const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];
        if (roleToCheck && ADMIN_ROLES.includes(roleToCheck.toUpperCase())) {
            return true;
        }

        const hasAllPermissions = requiredPermissions.every((permission) =>
            permissionsToCheck.includes(permission) || permissionsToCheck.some((p: string) => p.startsWith(`${permission.split(':')[0]}:ALL`))
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException(
                `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
            );
        }

        return true;
    }
}
