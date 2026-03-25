import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private _extendedClient;

  constructor(private tenantService: TenantService) {
    super({ log: ['warn', 'error'] });

    // Capture in local var so it's accessible inside the $extends callback closure
    const rawClient = this;

    // Extended client — automatically injects tenantId / branchId
    this._extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenantId = tenantService.getTenantId();
            const branchId = tenantService.getBranchId();

            if (!tenantId) return query(args);

            const modelsWithTenant = ['Order', 'Table', 'Product', 'Warehouse', 'KitchenStation', 'Reservation', 'WaitingEntry', 'Printer', 'Shift', 'DrawerSession', 'TableSection', 'User', 'StockMovement', 'StockTransfer', 'Promotion', 'PromoCode', 'Customer', 'Vendor', 'Category', 'Discount', 'Settings', 'UserPermission', 'Menu', 'BranchSettings'];
            const modelsWithBranch = ['Order', 'Table', 'Warehouse', 'KitchenStation', 'Reservation', 'WaitingEntry', 'Printer', 'Shift', 'DrawerSession', 'TableSection', 'User', 'Menu'];

            const needsTenant = modelsWithTenant.includes(model);
            const needsBranch = branchId && modelsWithBranch.includes(model);

            if (['findMany', 'findFirst', 'findUnique', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
              const queryArgs = args as any;

              // findUnique cannot have extra non-unique fields in where clause.
              // Redirect to findFirst on the raw (unextended) client to avoid infinite recursion.
              if (operation === 'findUnique' && (needsTenant || needsBranch)) {
                const where: any = { ...queryArgs.where };
                if (needsTenant) where.tenantId = tenantId;
                if (needsBranch) {
                  if (model === 'User') {
                    // ADMIN (Tenant Owner) / SUPER_ADMIN are tenant-wide — they bypass branch scoping.
                    where.AND = [
                      { tenantId },
                      { OR: [{ branchId }, { branchId: null }, { role: 'ADMIN' }, { role: 'SUPER_ADMIN' }] },
                    ];
                  } else {
                    where.branchId = branchId;
                  }
                }
                const modelKey = model.charAt(0).toLowerCase() + model.slice(1);
                return (rawClient as any)[modelKey].findFirst({ ...queryArgs, where });
              }

              if (needsTenant) {
                queryArgs.where = { ...queryArgs.where, tenantId };
              }

              if (needsBranch) {
                if (model === 'User') {
                  // ADMIN (Tenant Owner) / SUPER_ADMIN are tenant-wide — they bypass branch scoping.
                  // This means the POS lock screen owner PIN works on any branch.
                  queryArgs.where = {
                    ...queryArgs.where,
                    AND: [
                      { tenantId },
                      { OR: [{ branchId }, { branchId: null }, { role: 'ADMIN' }, { role: 'SUPER_ADMIN' }] },
                    ],
                  };
                } else {
                  queryArgs.where = { ...queryArgs.where, branchId };
                }
              }
            }

            if (operation === 'create' || operation === 'createMany') {
              const queryArgs = args as any;
              const injectData: any = {};
              if (needsTenant) injectData.tenantId = tenantId;
              if (needsBranch) injectData.branchId = branchId;
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

  /** Extended client — auto-injects tenant/branch filters. Use for most operations. */
  get client() {
    return this._extendedClient;
  }

  /** Unextended base client — pass tenant filters manually. Use for complex nested include queries. */
  get rawClient() {
    return this as any;
  }

  async onModuleInit() {
    await this.$connect();
  }
}
