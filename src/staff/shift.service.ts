import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { ClockInDto, ClockOutDto, StartBreakDto } from './dto/shift.dto';

@Injectable()
export class ShiftService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantService: TenantService,
    ) { }

    async clockIn(userId: string, dto: ClockInDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        // Check for open shift
        const openShift = await (this.prisma.client as any).shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
        });

        if (openShift) {
            throw new BadRequestException('You already have an open shift');
        }

        return (this.prisma.client as any).shift.create({
            data: {
                userId,
                tenantId,
                startTime: new Date(),
                status: 'OPEN',
                note: dto.note,
            },
        });
    }

    async getCurrentShift(userId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const shift = await (this.prisma.client as any).shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: {
                breaks: {
                    orderBy: { startTime: 'asc' },
                }
            }
        });
        
        // Return shift and current server time to help frontend synchronize clocks
        return {
            shift: shift ?? null,
            serverTime: new Date(),
        };
    }

    async clockOut(userId: string, dto: ClockOutDto) {
        const tenantId = this.tenantService.getTenantId();
        const shift = await (this.prisma.client as any).shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: { breaks: true }
        });

        if (!shift) {
            throw new BadRequestException('No active shift found');
        }

        // End any open break
        const openBreak = shift.breaks.find((b: any) => !b.endTime);
        if (openBreak) {
            await (this.prisma.client as any).shiftBreak.update({
                where: { id: openBreak.id },
                data: { endTime: new Date() }
            });
        }

        return (this.prisma.client as any).shift.update({
            where: { id: shift.id },
            data: {
                endTime: new Date(),
                status: 'CLOSED',
                note: dto.note || shift.note
            }
        });
    }

    async startBreak(userId: string, dto: StartBreakDto) {
        const tenantId = this.tenantService.getTenantId();
        const shift = await (this.prisma.client as any).shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: { breaks: true }
        });

        if (!shift) {
            throw new BadRequestException('Must have an active shift to start a break');
        }

        if (shift.breaks.some((b: any) => !b.endTime)) {
            throw new BadRequestException('You are already on a break');
        }

        return (this.prisma.client as any).shiftBreak.create({
            data: {
                shiftId: shift.id,
                startTime: new Date(),
                type: dto.type,
            }
        });
    }

    async endBreak(userId: string) {
        const tenantId = this.tenantService.getTenantId();
        const shift = await (this.prisma.client as any).shift.findFirst({
            where: { userId, status: 'OPEN', tenantId },
            include: { breaks: true }
        });

        if (!shift) {
            throw new BadRequestException('No active shift found');
        }

        const openBreak = shift.breaks.find((b: any) => !b.endTime);
        if (!openBreak) {
            throw new BadRequestException('Not currently on a break');
        }

        return (this.prisma.client as any).shiftBreak.update({
            where: { id: openBreak.id },
            data: { endTime: new Date() }
        });
    }

    async getAllShifts(from?: Date, to?: Date, branchId?: string) {
        const tenantId = this.tenantService.getTenantId();
        const where: any = { tenantId };
        // branchId filter is automatically handled by PrismaService extension if in context

        if (from || to) {
            where.startTime = {};
            if (from) where.startTime.gte = from;
            if (to) where.startTime.lte = to;
        }

        return (this.prisma.client as any).shift.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                breaks: true,
                branch: { select: { name: true } }
            },
            orderBy: { startTime: 'desc' }
        });
    }
}
