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
exports.CmsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
let CmsService = class CmsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllContent() {
        return this.prisma.landingContent.findMany({ orderBy: { section: 'asc' } });
    }
    async getContentBySection(section) {
        const content = await this.prisma.landingContent.findUnique({ where: { section } });
        if (!content)
            throw new common_1.NotFoundException(`Section "${section}" not found`);
        return content;
    }
    async upsertContent(section, dto) {
        return this.prisma.landingContent.upsert({
            where: { section },
            update: { ...dto },
            create: { section, ...dto },
        });
    }
    async deleteContent(section) {
        return this.prisma.landingContent.delete({ where: { section } });
    }
    async getActivePlans() {
        return this.prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }
    async getAllPlans() {
        return this.prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } });
    }
    async createPlan(dto) {
        return this.prisma.subscriptionPlan.create({ data: dto });
    }
    async updatePlan(id, dto) {
        return this.prisma.subscriptionPlan.update({ where: { id }, data: dto });
    }
    async deletePlan(id) {
        return this.prisma.subscriptionPlan.delete({ where: { id } });
    }
    async selfRegister(dto) {
        const existing = await this.prisma.user.findFirst({
            where: { email: dto.adminEmail },
        });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const hashedPassword = await bcrypt.hash(dto.adminPassword, 12);
        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.tenantName,
                    type: dto.type || 'RESTAURANT',
                    planId: dto.planId,
                },
            });
            const user = await tx.user.create({
                data: {
                    email: dto.adminEmail,
                    password: hashedPassword,
                    name: `${dto.adminFirstName} ${dto.adminLastName}`,
                    role: 'ADMIN',
                    tenantId: tenant.id,
                },
            });
            await tx.branch.create({
                data: {
                    name: 'Main Branch',
                    tenantId: tenant.id,
                    isActive: true,
                }
            });
            return { tenantId: tenant.id, userId: user.id, message: 'Registration successful! You can now log in.' };
        });
    }
    async submitContact(dto) {
        return this.prisma.contactMessage.create({ data: dto });
    }
    async getContactMessages() {
        return this.prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async markContactRead(id) {
        return this.prisma.contactMessage.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async deleteContactMessage(id) {
        return this.prisma.contactMessage.delete({ where: { id } });
    }
};
exports.CmsService = CmsService;
exports.CmsService = CmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CmsService);
//# sourceMappingURL=cms.service.js.map