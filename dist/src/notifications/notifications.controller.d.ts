import { NotificationsService } from './notifications.service';
import { MarkReadDto } from './dto/notifications.dto';
import { TenantService } from '../tenant/tenant.service';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly tenantService;
    constructor(notificationsService: NotificationsService, tenantService: TenantService);
    findAll(req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        branchId: string | null;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        meta: import("@prisma/client/runtime/library").JsonValue | null;
        message: string;
        isRead: boolean;
    }[]>;
    markRead(dto: MarkReadDto): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
