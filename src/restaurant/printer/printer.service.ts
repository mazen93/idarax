import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrinterService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, data: any) {
        return this.prisma.printer.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string, branchId?: string) {
        return this.prisma.printer.findMany({
            where: {
                tenantId,
                ...(branchId ? { branchId } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, tenantId: string) {
        const printer = await this.prisma.printer.findFirst({
            where: { id, tenantId },
        });
        if (!printer) throw new NotFoundException('Printer not found');
        return printer;
    }

    async update(id: string, tenantId: string, data: any) {
        await this.findOne(id, tenantId);
        return this.prisma.printer.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, tenantId: string) {
        await this.findOne(id, tenantId);
        return this.prisma.printer.delete({
            where: { id },
        });
    }
}
