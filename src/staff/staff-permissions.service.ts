import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Actions, RoleDefaultPermissions } from '../auth/permissions.constants';

@Injectable()
export class StaffPermissionsService {
    constructor(private prisma: PrismaService) { }

    async getAllUsersWithPermissions(tenantId: string) {
        return this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                branchId: true,
                permissions: {
                    select: {
                        action: true,
                    },
                },
            },
        });
    }

    async getUserPermissions(userId: string) {
        const permissions = await this.prisma.userPermission.findMany({
            where: { userId },
            select: { action: true },
        });
        return permissions.map((p) => p.action);
    }

    async setPermissions(userId: string, tenantId: string, actions: string[]) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Atomic update: delete old and insert new in a transaction
        return this.prisma.$transaction(async (tx) => {
            await tx.userPermission.deleteMany({
                where: { userId },
            });

            if (actions.length > 0) {
                await tx.userPermission.createMany({
                    data: actions.map((action) => ({
                        userId,
                        action,
                        tenantId,
                    })),
                });
            }

            return { success: true, count: actions.length };
        });
    }

    getRoleDefaults() {
        return RoleDefaultPermissions;
    }

    getAvailableActions() {
        return Actions;
    }
}
