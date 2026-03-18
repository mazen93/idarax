import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertLandingContentDto, CreatePlanDto, UpdatePlanDto, SelfRegisterDto } from './dto/cms.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CmsService {
    constructor(private prisma: PrismaService) { }

    // ─── Landing Content ─────────────────────────────────────────────────────────

    async getAllContent() {
        return (this.prisma as any).landingContent.findMany({ orderBy: { section: 'asc' } });
    }

    async getContentBySection(section: string) {
        const content = await (this.prisma as any).landingContent.findUnique({ where: { section } });
        if (!content) throw new NotFoundException(`Section "${section}" not found`);
        return content;
    }

    async upsertContent(section: string, dto: UpsertLandingContentDto) {
        return (this.prisma as any).landingContent.upsert({
            where: { section },
            update: { ...dto },
            create: { section, ...dto },
        });
    }

    async deleteContent(section: string) {
        return (this.prisma as any).landingContent.delete({ where: { section } });
    }

    // ─── Subscription Plans ──────────────────────────────────────────────────────

    async getActivePlans() {
        return (this.prisma as any).subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }

    async getAllPlans() {
        return (this.prisma as any).subscriptionPlan.findMany({ orderBy: { price: 'asc' } });
    }

    async createPlan(dto: CreatePlanDto) {
        return (this.prisma as any).subscriptionPlan.create({ data: dto });
    }

    async updatePlan(id: string, dto: UpdatePlanDto) {
        return (this.prisma as any).subscriptionPlan.update({ where: { id }, data: dto });
    }

    async deletePlan(id: string) {
        return (this.prisma as any).subscriptionPlan.delete({ where: { id } });
    }

    // ─── Self-Registration ───────────────────────────────────────────────────────

    async selfRegister(dto: SelfRegisterDto) {
        const existing = await (this.prisma as any).user.findFirst({
            where: { email: dto.adminEmail },
        });
        if (existing) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.adminPassword, 12);

        return (this.prisma as any).$transaction(async (tx: any) => {
            // 1. Create tenant
            const tenant = await tx.tenant.create({
                data: { name: dto.tenantName },
            });

            // 2. Create admin user for that tenant
            const user = await tx.user.create({
                data: {
                    email: dto.adminEmail,
                    password: hashedPassword,
                    firstName: dto.adminFirstName,
                    lastName: dto.adminLastName,
                    role: 'ADMIN',
                    tenantId: tenant.id,
                },
            });

            return { tenantId: tenant.id, userId: user.id, message: 'Registration successful! You can now log in.' };
        });
    }
}
