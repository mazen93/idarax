import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private _extendedClient;

  constructor(private tenantService: TenantService) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://idarax_user:idarax_password@127.0.0.1:5433/idarax_db?schema=public';
    
    // The pg warning often comes from misconfigured pools when using adapter-pg
    // We'll ensure we use a stable pool configuration
    const pool = new Pool({ 
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    const adapter = new PrismaPg(pool);
    console.log(`🔌 Initializing Prisma with pg Pool on: ${connectionString.split('@')[1]}`);

    super({ adapter, log: ['warn', 'error'] });

    this._extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenantId = tenantService.getTenantId();
            const branchId = tenantService.getBranchId();

            if (!tenantId) return query(args);

            const modelsWithTenant = ['Order', 'Table', 'Product', 'Warehouse', 'KitchenStation', 'Reservation', 'WaitingEntry', 'Printer', 'Shift', 'DrawerSession', 'TableSection', 'User', 'StockMovement', 'StockTransfer', 'Promotion', 'PromoCode', 'Customer', 'Vendor', 'Category', 'Discount', 'Settings', 'UserPermission', 'Menu'];
            const modelsWithBranch = ['Order', 'Table', 'Warehouse', 'KitchenStation', 'Reservation', 'WaitingEntry', 'Printer', 'Shift', 'DrawerSession', 'TableSection', 'User', 'Menu'];

            // Add tenantId/branchId to filters for read/update/delete operations
            if (['findMany', 'findFirst', 'findUnique', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
              let queryArgs = args as any;

              // findUnique doesn't support non-unique fields in where, convert to findFirst
              if (operation === 'findUnique' && (modelsWithTenant.includes(model) || (branchId && modelsWithBranch.includes(model)))) {
                operation = 'findFirst';
              }

              if (modelsWithTenant.includes(model)) {
                queryArgs.where = { ...queryArgs.where, tenantId };
              }

              if (branchId && modelsWithBranch.includes(model)) {
                queryArgs.where = { ...queryArgs.where, branchId };
              }
            }

            // Automatically inject tenantId/branchId into create operations
            if (operation === 'create' || operation === 'createMany') {
              const queryArgs = args as any;
              const injectData: any = {};

              if (modelsWithTenant.includes(model)) {
                injectData.tenantId = tenantId;
              }

              if (branchId && modelsWithBranch.includes(model)) {
                injectData.branchId = branchId;
              }

              if (Object.keys(injectData).length > 0) {
                if (Array.isArray(queryArgs.data)) {
                  queryArgs.data = queryArgs.data.map((item: any) => ({ ...item, ...injectData }));
                } else {
                  queryArgs.data = { ...queryArgs.data, ...injectData };
                }
              }
            }

            return query(args);
          },
        },
      },
    });
  }

  get client() {
    return this._extendedClient;
  }

  async onModuleInit() {
    await this.$connect();
  }
}
