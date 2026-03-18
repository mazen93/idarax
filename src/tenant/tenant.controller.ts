import { Controller, Get, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('admin/tenants')
@UseGuards(JwtAuthGuard)
export class TenantAdminController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getAllTenants(@Req() req: any) {
        // Enforce Super Admin only
        if (req.user?.role !== 'SUPER_ADMIN') {
            throw new UnauthorizedException('Superadmin access required');
        }

        const tenants = await this.prisma.tenant.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        orders: true,
                        products: true,
                    }
                },
                users: {
                    where: { role: 'ADMIN' },
                    select: { email: true, name: true, createdAt: true },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return tenants;
    }
}
