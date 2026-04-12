import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertLandingContentDto, CreatePlanDto, UpdatePlanDto, SelfRegisterDto, SubmitContactDto } from './dto/cms.dto';
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


    // ─── Self-Registration ───────────────────────────────────────────────────────

    async selfRegister(dto: SelfRegisterDto) {
        const existing = await (this.prisma as any).user.findFirst({
            where: { email: dto.adminEmail },
        });
        if (existing) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.adminPassword, 12);

        return (this.prisma as any).$transaction(async (tx: any) => {
            const tenant = await tx.tenant.create({
                data: { 
                    name: dto.tenantName, 
                    type: (dto.type as any) || 'RESTAURANT',
                    planId: dto.planId,
                    isActive: false, // Must be approved by super admin
                    status: 'PENDING',
                    country: dto.country,
                    countryCode: dto.countryCode,
                    vatNumber: dto.vatNumber,
                },
            });

            // Create initial upgrade/subscription request
            if (dto.planId) {
                await tx.upgradeRequest.create({
                    data: {
                        tenantId: tenant.id,
                        toPlanId: dto.planId,
                        status: 'PENDING',
                        note: 'Initial subscription during registration'
                    }
                });
            }

            const user = await tx.user.create({
                data: {
                    email: dto.adminEmail,
                    password: hashedPassword,
                    name: `${dto.adminFirstName} ${dto.adminLastName}`,
                    role: 'ADMIN',
                    tenantId: tenant.id,
                },
            });

            // Create default branch
            await tx.branch.create({
                data: {
                    name: 'Main Branch',
                    tenantId: tenant.id,
                    isActive: true, // Internal branch remains active, but tenant is not
                }
            });

            return { tenantId: tenant.id, userId: user.id, message: 'Registration successful! Your account is pending Super Admin approval. You will be notified once activated.' };
        });
    }

    // ─── Contact Messages ─────────────────────────────────────────────────────────

    async submitContact(dto: SubmitContactDto) {
        return (this.prisma as any).contactMessage.create({ data: dto });
    }

    async getContactMessages() {
        return (this.prisma as any).contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async markContactRead(id: string) {
        return (this.prisma as any).contactMessage.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async deleteContactMessage(id: string) {
        return (this.prisma as any).contactMessage.delete({ where: { id } });
    }
}
