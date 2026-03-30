import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { UpdateSettingsDto } from './dto/settings.dto';
export declare class SettingsService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    get(): Promise<any>;
    update(dto: UpdateSettingsDto): Promise<any>;
}
