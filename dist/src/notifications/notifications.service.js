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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = class NotificationsService {
    prisma;
    gateway;
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async create(tenantId, dto) {
        const notification = await this.prisma.client.notification.create({
            data: {
                tenantId,
                branchId: dto.branchId ?? null,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                meta: dto.meta ?? undefined,
            },
        });
        this.gateway.notifyTenant(tenantId, notification);
        return notification;
    }
    async findAll(tenantId, branchId) {
        return this.prisma.client.notification.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async markRead(tenantId, ids) {
        return this.prisma.client.notification.updateMany({
            where: { tenantId, id: { in: ids } },
            data: { isRead: true },
        });
    }
    async markAllRead(tenantId) {
        return this.prisma.client.notification.updateMany({
            where: { tenantId, isRead: false },
            data: { isRead: true },
        });
    }
    async remove(tenantId, id) {
        return this.prisma.client.notification.deleteMany({
            where: { tenantId, id },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map