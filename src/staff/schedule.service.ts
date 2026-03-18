import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { ScheduledShiftStatus } from '@prisma/client';

@Injectable()
export class ScheduleService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async create(dto: { userId: string; branchId: string; startAt: Date; endAt: Date; status?: ScheduledShiftStatus }) {
        const tenantId = this.tenantService.getTenantId();

        // Conflict detection: same user, overlapping time
        const conflict = await (this.prisma as any).scheduledShift.findFirst({
            where: {
                userId: dto.userId,
                tenantId,
                status: { not: 'CANCELLED' },
                OR: [
                    {
                        startAt: { lt: dto.endAt },
                        endAt: { gt: dto.startAt },
                    },
                ],
            },
        });

        if (conflict) {
            throw new BadRequestException('Shift overlaps with an existing scheduled shift for this user.');
        }

        return (this.prisma as any).scheduledShift.create({
            data: {
                ...dto,
                tenantId,
            }
        });
    }

    async findAll(startDate: Date, endDate: Date, branchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).scheduledShift.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
                startAt: { gte: startDate },
                endAt: { lte: endDate },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                branch: { select: { id: true, name: true } },
            },
            orderBy: { startAt: 'asc' },
        });
    }

    async findByUser(userId: string, startDate: Date, endDate: Date) {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma as any).scheduledShift.findMany({
            where: {
                tenantId,
                userId,
                startAt: { gte: startDate },
                endAt: { lte: endDate },
            },
            include: {
                branch: { select: { id: true, name: true } },
            },
            orderBy: { startAt: 'asc' },
        });
    }

    async update(id: string, dto: { startAt?: Date; endAt?: Date; status?: ScheduledShiftStatus; branchId?: string }) {
        const tenantId = this.tenantService.getTenantId();
        const existing = await (this.prisma as any).scheduledShift.findFirst({
            where: { id, tenantId }
        });

        if (!existing) throw new NotFoundException('Scheduled shift not found');

        // If time changes, check for conflicts again
        if (dto.startAt || dto.endAt) {
            const start = dto.startAt || existing.startAt;
            const end = dto.endAt || existing.endAt;

            const conflict = await (this.prisma as any).scheduledShift.findFirst({
                where: {
                    id: { not: id },
                    userId: existing.userId,
                    tenantId,
                    status: { not: 'CANCELLED' },
                    OR: [
                        {
                            startAt: { lt: end },
                            endAt: { gt: start },
                        },
                    ],
                },
            });

            if (conflict) {
                throw new BadRequestException('Updated time overlaps with an existing scheduled shift.');
            }
        }

        return (this.prisma as any).scheduledShift.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        const existing = await (this.prisma as any).scheduledShift.findFirst({
            where: { id, tenantId }
        });

        if (!existing) throw new NotFoundException('Scheduled shift not found');

        return (this.prisma as any).scheduledShift.delete({ where: { id } });
    }
}
