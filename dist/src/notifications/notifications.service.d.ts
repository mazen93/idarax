import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: NotificationsGateway);
    create(tenantId: string, dto: CreateNotificationDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        tenantId: string;
        branchId: string | null;
        title: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        message: string;
        isRead: boolean;
    }>;
    findAll(tenantId: string, branchId?: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        tenantId: string;
        branchId: string | null;
        title: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        message: string;
        isRead: boolean;
    }[]>;
    markRead(tenantId: string, ids: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(tenantId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(tenantId: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
