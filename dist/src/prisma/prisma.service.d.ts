import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantService } from '../tenant/tenant.service';
export declare class PrismaService extends PrismaClient implements OnModuleInit {
    private tenantService;
    private _extendedClient;
    constructor(tenantService: TenantService);
    get client(): import("@prisma/client/runtime/library").DynamicClientExtensionThis<import(".prisma/client").Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
        result: {};
        model: {};
        query: {};
        client: {};
    }, import(".prisma/client").Prisma.PrismaClientOptions>, import(".prisma/client").Prisma.TypeMapCb, {
        result: {};
        model: {};
        query: {};
        client: {};
    }, {}>;
    get rawClient(): any;
    onModuleInit(): Promise<void>;
}
