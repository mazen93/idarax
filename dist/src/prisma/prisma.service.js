"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const tenant_service_1 = require("../tenant/tenant.service");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    tenantService;
    _extendedClient;
    constructor(tenantService) {
        const connectionString = process.env.DATABASE_URL || 'postgresql://idarax_user:idarax_password@127.0.0.1:5433/idarax_db?schema=public';
        const pool = new pg_1.Pool({
            connectionString,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        const adapter = new adapter_pg_1.PrismaPg(pool);
        console.log(`🔌 Initializing Prisma with pg Pool on: ${connectionString.split('@')[1]}`);
        super({ adapter, log: ['warn', 'error'] });
        this.tenantService = tenantService;
        this._extendedClient = this.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const tenantId = tenantService.getTenantId();
                        const branchId = tenantService.getBranchId();
                        if (!tenantId)
                            return query(args);
                        const modelsWithTenant = ['Order', 'Table', 'Product', 'Warehouse', 'KitchenStation', 'Reservation', 'WaitingEntry', 'Printer', 'Shift', 'DrawerSession', 'TableSection', 'User', 'StockMovement', 'StockTransfer', 'Promotion', 'PromoCode', 'Customer', 'Vendor', 'Category', 'Discount', 'Settings', 'UserPermission', 'Menu'];
                        const modelsWithBranch = ['Order', 'Table', 'Warehouse', 'KitchenStation', 'Reservation', 'WaitingEntry', 'Printer', 'Shift', 'DrawerSession', 'TableSection', 'User', 'Menu'];
                        if (['findMany', 'findFirst', 'findUnique', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
                            let queryArgs = args;
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
                        if (operation === 'create' || operation === 'createMany') {
                            const queryArgs = args;
                            const injectData = {};
                            if (modelsWithTenant.includes(model)) {
                                injectData.tenantId = tenantId;
                            }
                            if (branchId && modelsWithBranch.includes(model)) {
                                injectData.branchId = branchId;
                            }
                            if (Object.keys(injectData).length > 0) {
                                if (Array.isArray(queryArgs.data)) {
                                    queryArgs.data = queryArgs.data.map((item) => ({ ...item, ...injectData }));
                                }
                                else {
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
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map