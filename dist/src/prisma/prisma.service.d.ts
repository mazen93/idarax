import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantService } from '../tenant/tenant.service';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    private tenantService;
    private _extendedClient;
    constructor(tenantService: TenantService);
    get client(): import("@prisma/client/runtime/client").DynamicClientExtensionThis<import("@prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/client").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>, import("@prisma/client").Prisma.TypeMapCb<import("@prisma/client").Prisma.PrismaClientOptions>, {
        result: {};
        model: {};
        query: {};
        client: {};
    }>;
    onModuleInit(): Promise<void>;
}
