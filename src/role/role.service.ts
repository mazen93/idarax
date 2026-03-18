import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) {}

    async create(dto: CreateRoleDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const existing = await (this.prisma.client as any).role.findFirst({
            where: { name: dto.name, tenantId }
        });
        if (existing) throw new ConflictException(`Role with name ${dto.name} already exists`);

        const role = await (this.prisma.client as any).role.create({
            data: {
                name: dto.name,
                description: dto.description,
                tenantId,
                permissions: {
                    create: dto.permissions.map(action => ({ action, tenantId }))
                }
            },
            include: { permissions: { select: { action: true } } }
        });

        return {
            ...role,
            permissions: role.permissions.map((p: any) => p.action)
        };
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const roles = await (this.prisma.client as any).role.findMany({
            where: { tenantId },
            include: { permissions: { select: { action: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return roles.map((r: any) => ({
            ...r,
            permissions: r.permissions.map((p: any) => p.action)
        }));
    }

    async findOne(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const role = await (this.prisma.client as any).role.findUnique({
            where: { id },
            include: { permissions: { select: { action: true } } }
        });

        if (!role || role.tenantId !== tenantId) {
            throw new NotFoundException('Role not found');
        }

        return {
            ...role,
            permissions: role.permissions.map((p: any) => p.action)
        };
    }

    async update(id: string, dto: UpdateRoleDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const role = await (this.prisma.client as any).role.findUnique({ where: { id } });
        if (!role || role.tenantId !== tenantId) {
            throw new NotFoundException('Role not found');
        }

        if (dto.name && dto.name !== role.name) {
            const existing = await (this.prisma.client as any).role.findFirst({
                where: { name: dto.name, tenantId, id: { not: id } }
            });
            if (existing) throw new ConflictException(`Role with name ${dto.name} already exists`);
        }

        const data: any = {};
        if (dto.name) data.name = dto.name;
        if (dto.description !== undefined) data.description = dto.description;

        await (this.prisma.client as any).role.update({
            where: { id },
            data
        });

        if (dto.permissions) {
            await (this.prisma.client as any).rolePermission.deleteMany({ where: { roleId: id } });
            if (dto.permissions.length > 0) {
                await (this.prisma.client as any).rolePermission.createMany({
                    data: dto.permissions.map(action => ({ action, roleId: id, tenantId }))
                });
            }
        }

        return this.findOne(id);
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const role = await (this.prisma.client as any).role.findUnique({ where: { id } });
        if (!role || role.tenantId !== tenantId) {
            throw new NotFoundException('Role not found');
        }

        await (this.prisma.client as any).role.delete({ where: { id } });
        return { success: true };
    }
}
