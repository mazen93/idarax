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
exports.BranchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../tenant.service");
let BranchService = class BranchService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    get db() {
        return this.prisma.client.branch;
    }
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.db.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        orders: true,
                        tables: true,
                    }
                }
            }
        });
    }
    async findOne(id) {
        const branch = await this.db.findUnique({
            where: { id },
        });
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        return branch;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.$transaction(async (tx) => {
            const branch = await tx.branch.create({
                data: {
                    ...dto,
                    tenantId,
                },
            });
            const products = await tx.product.findMany({
                where: { tenantId },
                select: { id: true },
            });
            if (products.length > 0) {
                await tx.branchProduct.createMany({
                    data: products.map((p) => ({
                        branchId: branch.id,
                        productId: p.id,
                        isAvailable: true,
                    })),
                    skipDuplicates: true,
                });
            }
            await tx.warehouse.create({
                data: {
                    name: `Main Warehouse - ${branch.name}`,
                    tenantId,
                    branchId: branch.id,
                },
            });
            await tx.kitchenStation.create({
                data: {
                    name: `Main Kitchen - ${branch.name}`,
                    tenantId,
                    branchId: branch.id,
                },
            });
            await tx.tableSection.create({
                data: {
                    name: `Main Floor - ${branch.name}`,
                    tenantId,
                    branchId: branch.id,
                },
            });
            return branch;
        });
    }
    async update(id, dto) {
        const branch = await this.findOne(id);
        if (dto.isActive === false && branch.isActive === true) {
            const activeBranchesCount = await this.db.count({
                where: { isActive: true },
            });
            if (activeBranchesCount <= 1) {
                throw new common_1.BadRequestException('Cannot deactivate the only active branch. You must have at least one active branch.');
            }
        }
        return this.db.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.db.delete({
            where: { id },
        });
    }
};
exports.BranchService = BranchService;
exports.BranchService = BranchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], BranchService);
//# sourceMappingURL=branch.service.js.map