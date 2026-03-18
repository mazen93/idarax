import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    async create(dto: CreateUserDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const existing = await this.prisma.client.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email already in use');

        if (dto.pinCode) {
            const existingPin = await this.prisma.client.user.findFirst({
                where: { pinCode: dto.pinCode, tenantId }
            });
            if (existingPin) throw new ConflictException('PIN code already in use by another staff member');
        }

        const hashedPassword = await bcrypt.hash(dto.password || 'password123', 10);

        const data: any = {
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            tenantId,
            pinCode: dto.pinCode,
        };
        if (dto.role) data.role = dto.role as UserRole;
        if (dto.roleId) data.roleId = dto.roleId;

        const user = await this.prisma.client.user.create({
            data,
            select: { id: true, name: true, email: true, role: true, roleId: true, createdAt: true, pinCode: true }
        });

        // Create permission records if provided
        if (dto.permissions && dto.permissions.length > 0) {
            await this.prisma.client.userPermission.createMany({
                data: dto.permissions.map(p => ({
                    userId: user.id,
                    tenantId,
                    action: p,
                })),
                skipDuplicates: true,
            });
        }

        const permissions = await this.prisma.client.userPermission.findMany({
            where: { userId: user.id },
            select: { action: true }
        });

        return { ...user, permissions: permissions.map(p => p.action) };
    }

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const users = await this.prisma.client.user.findMany({
            where: { tenantId },
            select: {
                id: true, name: true, email: true, role: true, roleId: true, createdAt: true, branchId: true, pinCode: true,
                customRole: { select: { id: true, name: true, permissions: { select: { action: true } } } },
                permissions: { select: { action: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return users.map(u => {
            const directPerms = u.permissions.map(p => p.action);
            const rolePerms = u.customRole?.permissions.map(p => p.action) || [];
            return {
                ...u,
                permissions: Array.from(new Set([...directPerms, ...rolePerms]))
            };
        });
    }

    async findOne(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const user = await this.prisma.client.user.findUnique({
            where: { id },
            include: { 
                customRole: { include: { permissions: { select: { action: true } } } },
                permissions: { select: { action: true } } 
            }
        });

        if (!user || user.tenantId !== tenantId) throw new NotFoundException('User not found');

        const directPerms = user.permissions.map(p => p.action);
        const rolePerms = user.customRole?.permissions.map(p => p.action) || [];

        return {
            ...user,
            permissions: Array.from(new Set([...directPerms, ...rolePerms]))
        };
    }

    async update(id: string, dto: UpdateUserDto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const user = await this.prisma.client.user.findUnique({ where: { id } });
        if (!user || user.tenantId !== tenantId) throw new NotFoundException('User not found');

        const data: any = {};
        if (dto.name) data.name = dto.name;
        if (dto.role) data.role = dto.role as UserRole;
        if (dto.roleId !== undefined) data.roleId = dto.roleId;
        if ((dto as any).branchId !== undefined) data.branchId = (dto as any).branchId;
        if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

        if (dto.pinCode !== undefined) {
            if (dto.pinCode !== null) {
                const existingPin = await this.prisma.client.user.findFirst({
                    where: {
                        pinCode: dto.pinCode,
                        tenantId,
                        id: { not: id }
                    }
                });
                if (existingPin) throw new ConflictException('PIN code already in use by another staff member');
            }
            data.pinCode = dto.pinCode;
        }

        const updatedUser = await this.prisma.client.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, roleId: true, createdAt: true, branchId: true, pinCode: true }
        });

        // Replace permissions if provided
        if (dto.permissions !== undefined) {
            await this.prisma.client.userPermission.deleteMany({ where: { userId: id } });
            if (dto.permissions.length > 0) {
                await this.prisma.client.userPermission.createMany({
                    data: dto.permissions.map(p => ({
                        userId: id,
                        tenantId,
                        action: p,
                    })),
                    skipDuplicates: true,
                });
            }
        }

        const permissions = await this.prisma.client.userPermission.findMany({
            where: { userId: id },
            select: { action: true }
        });

        return { ...updatedUser, permissions: permissions.map(p => p.action) };
    }

    async remove(id: string) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId) throw new ForbiddenException('Tenant ID missing');

        const user = await this.prisma.client.user.findUnique({ where: { id } });
        if (!user || user.tenantId !== tenantId) throw new NotFoundException('User not found');

        return this.prisma.client.user.delete({ where: { id } });
    }
}
