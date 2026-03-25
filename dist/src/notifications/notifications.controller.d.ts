import { NotificationsService } from './notifications.service';
import { MarkReadDto } from './dto/notifications.dto';
import { TenantService } from '../tenant/tenant.service';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly tenantService;
    constructor(notificationsService: NotificationsService, tenantService: TenantService);
    findAll(req: any): Promise<any>;
    markRead(dto: MarkReadDto): Promise<any>;
    markAllRead(): Promise<any>;
    remove(id: string): Promise<any>;
}
