import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { RegisterSerialDto, UpdateSerialStatusDto } from './dto/serial.dto';

@Injectable()
export class SerialService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async register(dto: RegisterSerialDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const existing = await (this.prisma as any).serialNumber.findUnique({
            where: { serial_tenantId: { serial: dto.serial, tenantId } },
        });

        if (existing) {
            throw new ConflictException('Serial number already exists for this tenant');
        }

        return (this.prisma as any).serialNumber.create({
            data: {
                ...dto,
                tenantId,
            },
        });
    }

    async findBySerial(serial: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const result = await (this.prisma as any).serialNumber.findUnique({
            where: { serial_tenantId: { serial, tenantId } },
            include: { product: true },
        });

        if (!result) throw new NotFoundException('Serial number not found');

        return result;
    }

    async updateStatus(id: string, dto: UpdateSerialStatusDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const serialNumber = await (this.prisma as any).serialNumber.findUnique({
            where: { id },
        });

        if (!serialNumber || serialNumber.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied');
        }

        return (this.prisma as any).serialNumber.update({
            where: { id },
            data: { status: dto.status },
        });
    }

    async findByProduct(productId: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        return (this.prisma as any).serialNumber.findMany({
            where: { productId, tenantId },
        });
    }
}
