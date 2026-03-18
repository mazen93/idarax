import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../enums/permissions.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Super Admins bypass all checks
        if ((user.role as any) === 'SUPER_ADMIN') return true;

        const userPermissions = this.getPermissionsByRole(user.role);

        const hasPermission = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }

    private getPermissionsByRole(role: any): Permission[] {
        switch (role) {
            case 'ADMIN':
            case 'MANAGER':
                return Object.values(Permission);
            case 'STAFF':
                return [
                    Permission.CREATE_ORDER,
                    Permission.MANAGE_CUSTOMERS,
                ];
            default:
                return [];
        }
    }
}
