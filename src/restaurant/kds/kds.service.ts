import { Injectable, ForbiddenException, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { KdsGateway } from './kds.gateway';
import { CreateKitchenStationDto, UpdateOrderItemStatusDto, AssignStaffDto } from './dto/kds.dto';

@Injectable()
export class KdsService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
        @Inject(forwardRef(() => KdsGateway))
        private gateway: KdsGateway,
    ) { }

    async createStation(dto: CreateKitchenStationDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const { staffIds, ...rest } = dto;

        return (this.prisma.client as any).kitchenStation.create({
            data: {
                ...rest,
                tenantId,
                assignedStaff: staffIds ? {
                    connect: staffIds.map(id => ({ id }))
                } : undefined,
            },
            include: { assignedStaff: true }
        });
    }

    async getStations() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).kitchenStation.findMany({
            where: { tenantId },
            include: { assignedStaff: true }
        });
    }

    async assignStaff(stationId: string, dto: AssignStaffDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma.client as any).kitchenStation.update({
            where: { id: stationId, tenantId },
            data: {
                assignedStaff: {
                    set: dto.staffIds.map(id => ({ id }))
                }
            },
            include: { assignedStaff: true }
        });
    }

    async updateItemStatus(itemId: string, dto: UpdateOrderItemStatusDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Fetch item first to check permissions and station assignment
        const item = await (this.prisma.client as any).orderItem.findUnique({
            where: { id: itemId },
            include: {
                order: true,
                station: { include: { assignedStaff: true } }
            },
        });

        if (!item || item.order.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied');
        }

        // Validate staff PIN and assignment if PIN is provided
        if (dto.staff_pin) {
            const staff = await (this.prisma.client as any).user.findFirst({
                where: { pinCode: dto.staff_pin, tenantId },
            });

            if (!staff) {
                throw new UnauthorizedException('Invalid staff PIN');
            }

            // Check if staff is assigned to the station
            if (item.station) {
                const isAssigned = item.station.assignedStaff.some((s: any) => s.id === staff.id);
                if (!isAssigned) {
                    throw new ForbiddenException(`Staff member ${staff.name} is not assigned to station: ${item.station.name}`);
                }
            }
        }

        const updatedItem = await (this.prisma.client as any).orderItem.update({
            where: { id: itemId },
            data: { status: dto.status },
            include: {
                order: { include: { table: true } },
                product: {
                    include: {
                        usedInRecipes: { include: { ingredient: { select: { name: true } } } }
                    }
                },
            },
        });

        // Notify the specific station or all stations for this tenant
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

    async getStationItems(stationId: string) {
        const tenantId = this.tenantService.getTenantId();

        return (this.prisma.client as any).orderItem.findMany({
            where: {
                stationId,
                order: {
                    tenantId,
                    branchId: this.tenantService.getBranchId(),
                },
                status: { notIn: ['SERVED', 'CANCELLED'] },
            },
            include: {
                order: { include: { table: true } },
                product: {
                    include: {
                        usedInRecipes: { include: { ingredient: { select: { name: true } } } }
                    }
                },
            },
        });
    }
}
