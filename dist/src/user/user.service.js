"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_service_1 = require("../tenant/tenant.service");
const bcrypt = __importStar(require("bcryptjs"));
let UserService = class UserService {
    prisma;
    tenantService;
    constructor(prisma, tenantService) {
        this.prisma = prisma;
        this.tenantService = tenantService;
    }
    async create(dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const existing = await this.prisma.client.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        if (dto.pinCode) {
            const existingPin = await this.prisma.client.user.findFirst({
                where: { pinCode: dto.pinCode, tenantId }
            });
            if (existingPin)
                throw new common_1.ConflictException('PIN code already in use by another staff member');
        }
        const hashedPassword = await bcrypt.hash(dto.password || 'password123', 10);
        const data = {
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            tenantId,
            pinCode: dto.pinCode || null,
        };
        if (dto.role)
            data.role = dto.role;
        if (dto.roleId)
            data.roleId = dto.roleId;
        const user = await this.prisma.client.user.create({
            data,
            select: { id: true, name: true, email: true, role: true, roleId: true, createdAt: true, pinCode: true }
        });
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
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
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
    async findOne(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const user = await this.prisma.client.user.findUnique({
            where: { id },
            include: {
                customRole: { include: { permissions: { select: { action: true } } } },
                permissions: { select: { action: true } }
            }
        });
        if (!user || user.tenantId !== tenantId)
            throw new common_1.NotFoundException('User not found');
        const directPerms = user.permissions.map(p => p.action);
        const rolePerms = user.customRole?.permissions.map(p => p.action) || [];
        return {
            ...user,
            permissions: Array.from(new Set([...directPerms, ...rolePerms]))
        };
    }
    async update(id, dto) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const user = await this.prisma.client.user.findUnique({ where: { id } });
        if (!user || user.tenantId !== tenantId)
            throw new common_1.NotFoundException('User not found');
        const data = {};
        if (dto.name)
            data.name = dto.name;
        if (dto.role)
            data.role = dto.role;
        if (dto.roleId !== undefined)
            data.roleId = dto.roleId;
        if (dto.branchId !== undefined)
            data.branchId = dto.branchId;
        if (dto.password)
            data.password = await bcrypt.hash(dto.password, 10);
        if (dto.pinCode !== undefined) {
            if (dto.pinCode !== null) {
                const existingPin = await this.prisma.client.user.findFirst({
                    where: {
                        pinCode: dto.pinCode,
                        tenantId,
                        id: { not: id }
                    }
                });
                if (existingPin)
                    throw new common_1.ConflictException('PIN code already in use by another staff member');
            }
            data.pinCode = dto.pinCode;
        }
        const updatedUser = await this.prisma.client.user.update({
            where: { id },
            data,
            select: { id: true, name: true, email: true, role: true, roleId: true, createdAt: true, branchId: true, pinCode: true }
        });
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
    async remove(id) {
        const tenantId = this.tenantService.getTenantId();
        if (!tenantId)
            throw new common_1.ForbiddenException('Tenant ID missing');
        const user = await this.prisma.client.user.findUnique({ where: { id } });
        if (!user || user.tenantId !== tenantId)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.client.user.delete({ where: { id } });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenant_service_1.TenantService])
], UserService);
//# sourceMappingURL=user.service.js.map