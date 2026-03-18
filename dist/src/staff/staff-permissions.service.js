"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffPermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const permissions_constants_1 = require("../auth/permissions.constants");
let StaffPermissionsService = class StaffPermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllUsersWithPermissions(tenantId) {
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
    async getUserPermissions(userId) {
        const permissions = await this.prisma.userPermission.findMany({
            where: { userId },
            select: { action: true },
        });
        return permissions.map((p) => p.action);
    }
    async setPermissions(userId, tenantId, actions) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
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
        return permissions_constants_1.RoleDefaultPermissions;
    }
    getAvailableActions() {
        return permissions_constants_1.Actions;
    }
};
exports.StaffPermissionsService = StaffPermissionsService;
exports.StaffPermissionsService = StaffPermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffPermissionsService);
//# sourceMappingURL=staff-permissions.service.js.map