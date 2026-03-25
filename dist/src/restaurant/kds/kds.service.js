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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KdsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_service_1 = require("../../tenant/tenant.service");
const kds_gateway_1 = require("./kds.gateway");
let KdsService = class KdsService {
    prisma;
    tenantService;
    gateway;
    constructor(prisma, tenantService, gateway) {
        this.prisma = prisma;
        this.tenantService = tenantService;
        this.gateway = gateway;
    }
    async createStation(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const { staffIds, ...rest } = dto;
        return this.prisma.client.kitchenStation.create({
            data: {
                ...rest,
                tenantId,
                branchId: rest.branchId || this.tenantService.getBranchId(),
                assignedStaff: staffIds ? {
                    connect: staffIds.map(id => ({ id }))
                } : undefined,
            },
            include: { assignedStaff: true }
        });
    }
    async getStations() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const branchId = this.tenantService.getBranchId();
        return this.prisma.client.kitchenStation.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {})
            },
            include: { assignedStaff: true }
        });
    }
    async assignStaff(stationId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        return this.prisma.client.kitchenStation.update({
            where: { id: stationId, tenantId },
            data: {
                assignedStaff: {
                    set: dto.staffIds.map(id => ({ id }))
                }
            },
            include: { assignedStaff: true }
        });
    }
    async updateItemStatus(itemId, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const item = await this.prisma.client.orderItem.findUnique({
            where: { id: itemId },
            include: {
                order: true,
                station: { include: { assignedStaff: true } }
            },
        });
        if (!item || item.order.tenantId !== tenantId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (dto.staff_pin) {
            const staff = await this.prisma.client.user.findFirst({
                where: { pinCode: dto.staff_pin, tenantId },
            });
            if (!staff) {
                throw new common_1.UnauthorizedException('Invalid staff PIN');
            }
            if (item.station) {
                const isAssigned = item.station.assignedStaff.some((s) => s.id === staff.id);
                if (!isAssigned) {
                    throw new common_1.ForbiddenException(`Staff member ${staff.name} is not assigned to station: ${item.station.name}`);
                }
            }
        }
        const updateData = { status: dto.status };
        if (dto.status === 'PREPARING' && !item.startedAt) {
            updateData.startedAt = new Date();
        }
        else if (dto.status === 'READY' && !item.completedAt) {
            updateData.completedAt = new Date();
        }
        const updatedItem = await this.prisma.client.orderItem.update({
            where: { id: itemId },
            data: updateData,
            include: {
                order: { include: { table: true } },
                variant: true,
                modifiers: {
                    include: {
                        option: {
                            include: { modifier: true }
                        }
                    }
                },
                product: {
                    include: {
                        recipeComponents: { include: { ingredient: { select: { name: true } } } }
                    }
                },
            },
        });
        if (updatedItem.stationId) {
            this.gateway.notifyStationOrder(tenantId, updatedItem.stationId, updatedItem);
        }
        this.gateway.notifyNewOrder(tenantId, updatedItem);
        if (dto.status === 'READY') {
            this.gateway.server.to(`tenant:${tenantId}`).emit('order_ready', {
                orderId: updatedItem.orderId,
                itemId: updatedItem.id,
                product: updatedItem.product.name,
            });
        }
        return updatedItem;
    }
    async getStationItems(stationId) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.client.orderItem.findMany({
            where: {
                stationId,
                order: {
                    tenantId,
                    branchId: this.tenantService.getBranchId(),
                },
                status: { notIn: ['SERVED', 'CANCELLED'] },
                OR: [
                    { fireAt: null },
                    { fireAt: { lte: new Date() } }
                ]
            },
            include: {
                order: { include: { table: true } },
                variant: true,
                modifiers: {
                    include: {
                        option: {
                            include: { modifier: true }
                        }
                    }
                },
                product: {
                    include: {
                        recipeComponents: { include: { ingredient: { select: { name: true } } } }
                    }
                },
            },
        });
    }
};
exports.KdsService = KdsService;
exports.KdsService = KdsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => kds_gateway_1.KdsGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService,
        kds_gateway_1.KdsGateway])
], KdsService);
//# sourceMappingURL=kds.service.js.map