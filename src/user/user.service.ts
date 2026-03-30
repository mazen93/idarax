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

        const tenant = await (this.prisma as any).tenant.findUnique({
            where: { id: tenantId }, select: { maxUsers: true }
        });

        const userCount = await (this.prisma as any).user.count({
            where: { tenantId }
        });

        if (userCount >= (tenant?.maxUsers || 5)) {
            throw new ForbiddenException(`You have reached the maximum number of users (${tenant?.maxUsers || 5}) allowed for your current subscription plan. Please upgrade to add more staff.`);
        }

        if (dto.pinCode) {
            // Check uniqueness across the ENTIRE tenant (bypass branch-level filter)
            const existingPin = await (this.prisma as any).user.findFirst({
                where: { pinCode: dto.pinCode, tenantId }
            });
            if (existingPin) throw new ConflictException(`PIN code "${dto.pinCode}" is already in use by another staff member "${existingPin.name}" in this business.`);
        }

        const hashedPassword = await bcrypt.hash(dto.password || 'password123', 10);

        const data: any = {
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            tenantId,
            pinCode: dto.pinCode || null,
        };
        if (dto.role) data.role = dto.role as UserRole;
        if (dto.roleId) data.roleId = dto.roleId;
        if (dto.branchId) data.branchId = dto.branchId;
        if (dto.isActive !== undefined) data.isActive = dto.isActive;

        let user;
        try {
            user = await this.prisma.client.user.create({
                data,
                select: { id: true, name: true, email: true, role: true, roleId: true, createdAt: true, pinCode: true, isActive: true }
            });
        } catch (error) {
            console.error('FAILED TO CREATE USER. Data:', JSON.stringify(data, null, 2));
            console.error('Prisma Error:', error);
            throw error;
        }

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
                id: true, name: true, email: true, role: true, roleId: true, createdAt: true, branchId: true, pinCode: true, isActive: true,
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
        if (dto.roleId !== undefined) data.roleId = dto.roleId || null;
        if ((dto as any).branchId !== undefined) data.branchId = (dto as any).branchId || null;
        if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

        if (dto.pinCode !== undefined) {
            if (dto.pinCode !== null) {
                // Check uniqueness across the ENTIRE tenant (bypass branch-level filter)
                const existingPin = await (this.prisma as any).user.findFirst({
                    where: {
                        pinCode: dto.pinCode,
                        tenantId,
                        id: { not: id }
                    }
                });
                if (existingPin) throw new ConflictException(`PIN code "${dto.pinCode}" is already in use by staff member "${existingPin.name}".`);
            }
            data.pinCode = dto.pinCode;
        }
        if (dto.isActive !== undefined) data.isActive = dto.isActive;

        const updatedUser = await this.prisma.client.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, roleId: true, createdAt: true, branchId: true, pinCode: true, isActive: true }
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
