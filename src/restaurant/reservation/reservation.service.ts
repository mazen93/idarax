import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';

@Injectable()
export class ReservationService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }

    private get context() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        return { tenantId, branchId: this.tenantService.getBranchId() };
    }

    async create(dto: any) {
        const { date, ...rest } = dto;
        const { tenantId } = this.context;
        return (this.prisma.client as any).reservation.create({
            data: { ...rest, date: new Date(date), tenantId },
            include: { table: { select: { number: true } }, customer: { select: { name: true } } },
        });
    }

    async findAll() {
        const { tenantId } = this.context;
        return (this.prisma.client as any).reservation.findMany({
            where: { tenantId },
            include: { table: { select: { number: true } }, customer: { select: { name: true } } },
            orderBy: { date: 'asc' },
        });
    }

    async update(id: string, dto: any) {
        const res = await (this.prisma.client as any).reservation.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!res || res.tenantId !== tenantId) throw new NotFoundException('Reservation not found');
        const { date, ...rest } = dto;
        const data = date ? { ...rest, date: new Date(date) } : rest;
        return (this.prisma.client as any).reservation.update({
            where: { id },
            data,
            include: { table: { select: { number: true } } },
        });
    }

    async remove(id: string) {
        const res = await (this.prisma.client as any).reservation.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!res || res.tenantId !== tenantId) throw new NotFoundException('Reservation not found');
        return (this.prisma.client as any).reservation.delete({ where: { id } });
    }
}

@Injectable()
export class WaitingService {
    constructor(private prisma: PrismaService, private tenantService: TenantService) { }

    private get context() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');
        return { tenantId, branchId: this.tenantService.getBranchId() };
    }

    async create(dto: any) {
        const { tenantId, branchId } = this.context;
        return (this.prisma.client as any).waitingEntry.create({
            data: { ...dto, tenantId, branchId },
            include: { customer: { select: { name: true } } },
        });
    }

    async findAll() {
        const { tenantId, branchId } = this.context;
        const where: any = { tenantId };
        if (branchId) where.branchId = branchId;

        return (this.prisma.client as any).waitingEntry.findMany({
            where,
            include: { customer: { select: { name: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    async update(id: string, dto: any) {
        const entry = await (this.prisma.client as any).waitingEntry.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!entry || entry.tenantId !== tenantId) throw new NotFoundException('Entry not found');
        return (this.prisma.client as any).waitingEntry.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        const entry = await (this.prisma.client as any).waitingEntry.findUnique({ where: { id } });
        const { tenantId } = this.context;
        if (!entry || entry.tenantId !== tenantId) throw new NotFoundException('Entry not found');
        return (this.prisma.client as any).waitingEntry.delete({ where: { id } });
    }
}
