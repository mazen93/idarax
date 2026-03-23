import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  async create(tenantId: string, dto: CreateNotificationDto) {
    const notification = await (this.prisma.client as any).notification.create({
      data: {
        tenantId,
        branchId: dto.branchId ?? null,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        meta: dto.meta ?? undefined,
      },
    });

    // Push real-time event to all connected web clients for this tenant
    this.gateway.notifyTenant(tenantId, notification);

    return notification;
  }

  async findAll(tenantId: string, branchId?: string) {
    return (this.prisma.client as any).notification.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(tenantId: string, ids: string[]) {
    return (this.prisma.client as any).notification.updateMany({
      where: { tenantId, id: { in: ids } },
      data: { isRead: true },
    });
  }

  async markAllRead(tenantId: string) {
    return (this.prisma.client as any).notification.updateMany({
      where: { tenantId, isRead: false },
      data: { isRead: true },
    });
  }

  async remove(tenantId: string, id: string) {
    return (this.prisma.client as any).notification.deleteMany({
      where: { tenantId, id },
    });
  }
}
