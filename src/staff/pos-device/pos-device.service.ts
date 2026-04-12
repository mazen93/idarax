import { Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../../tenant/tenant.service';
import { RegisterDeviceDto, UpdateDeviceDto } from './dto/pos-device.dto';

@Injectable()
export class PosDeviceService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService,
    ) { }

    async register(dto: RegisterDeviceDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant context missing');

        // Check if device already registered for this tenant
        const existing = await (this.prisma.client as any).posDevice.findUnique({
            where: { deviceId: dto.deviceId }
        });

        if (existing) {
            if (existing.tenantId !== tenantId) {
                throw new ConflictException('This device is already registered to another tenant.');
            }
            
            // Just update last seen
            return (this.prisma.client as any).posDevice.update({
                where: { id: existing.id },
                data: { 
                    lastSeenAt: new Date(),
                    isActive: true, // Re-activate if it was inactive
                    branchId: dto.branchId || existing.branchId
                }
            });
        }

        // Check limits
        const tenant = await (this.prisma.client as any).tenant.findUnique({
            where: { id: tenantId },
            select: { maxPos: true }
        });

        const activeCount = await (this.prisma.client as any).posDevice.count({
            where: { tenantId, isActive: true }
        });

        if (activeCount >= (tenant?.maxPos || 1)) {
            const activeDevices = await (this.prisma.client as any).posDevice.findMany({
                where: { tenantId, isActive: true },
                select: { id: true, name: true, lastSeenAt: true }
            });
            
            throw new ForbiddenException({
                message: 'POS limit reached',
                limit: tenant?.maxPos || 1,
                activeDevices
            });
        }

        // Create new
        return (this.prisma.client as any).posDevice.create({
            data: {
                tenantId,
                branchId: dto.branchId || this.tenantService.getBranchId() || null,
                deviceId: dto.deviceId,
                name: dto.name || 'Unnamed Device',
                isActive: true
            }
        });
    }

    async getDevices() {
        const tenantId = this.tenantService.getTenantId();
        return (this.prisma.client as any).posDevice.findMany({
            where: { tenantId },
            orderBy: { lastSeenAt: 'desc' }
        });
    }

    async update(id: string, dto: UpdateDeviceDto) {
        const tenantId = this.tenantService.getTenantId();
        
        const device = await (this.prisma.client as any).posDevice.findUnique({
            where: { id }
        });

        if (!device || device.tenantId !== tenantId) {
            throw new NotFoundException('Device not found');
        }

        return (this.prisma.client as any).posDevice.update({
            where: { id },
            data: {
                name: dto.name,
                isActive: dto.isActive,
                updatedAt: new Date()
            }
        });
    }

    async deactivate(id: string) {
        return this.update(id, { isActive: false });
    }

    async validate(deviceId: string) {
        const tenantId = this.tenantService.getTenantId();
        const device = await (this.prisma.client as any).posDevice.findUnique({
            where: { deviceId }
        });

        if (!device || device.tenantId !== tenantId || !device.isActive) {
            return { isValid: false };
        }

        // Update last seen
        await (this.prisma.client as any).posDevice.update({
            where: { id: device.id },
            data: { lastSeenAt: new Date() }
        });

        return { isValid: true, device };
    }
}
