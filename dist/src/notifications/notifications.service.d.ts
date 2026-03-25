import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notifications.dto';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private readonly prisma;
    private readonly gateway;
    constructor(prisma: PrismaService, gateway: NotificationsGateway);
    create(tenantId: string, dto: CreateNotificationDto): Promise<any>;
    findAll(tenantId: string, branchId?: string): Promise<any>;
    markRead(tenantId: string, ids: string[]): Promise<any>;
    markAllRead(tenantId: string): Promise<any>;
    remove(tenantId: string, id: string): Promise<any>;
}
