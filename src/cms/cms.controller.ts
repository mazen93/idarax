import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { UpsertLandingContentDto, CreatePlanDto, UpdatePlanDto, SelfRegisterDto } from './dto/cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Landing Page CMS')
@Controller('cms')
export class CmsController {
    constructor(private readonly cmsService: CmsService) { }

    // ─── Public endpoints ─────────────────────────────────────────────────────────

    @Get('content')
    @ApiOperation({ summary: 'Get all landing page sections (public)' })
    getAllContent() {
        return this.cmsService.getAllContent();
    }

    @Get('content/:section')
    @ApiOperation({ summary: 'Get a specific section (public)' })
    getContentBySection(@Param('section') section: string) {
        return this.cmsService.getContentBySection(section);
    }

    @Get('plans')
    @ApiOperation({ summary: 'Get active subscription plans (public)' })
    getActivePlans() {
        return this.cmsService.getActivePlans();
    }

    @Post('register')
    @ApiOperation({ summary: 'Self-register a new tenant (public)' })
    selfRegister(@Body() dto: SelfRegisterDto) {
        return this.cmsService.selfRegister(dto);
    }

    // ─── Superadmin-protected endpoints ──────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Put('content/:section')
    @ApiOperation({ summary: 'Upsert a landing page section (superadmin)' })
    upsertContent(@Param('section') section: string, @Body() dto: UpsertLandingContentDto) {
        return this.cmsService.upsertContent(section, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('content/:section')
    @ApiOperation({ summary: 'Delete a landing page section (superadmin)' })
    deleteContent(@Param('section') section: string) {
        return this.cmsService.deleteContent(section);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('admin/plans')
    @ApiOperation({ summary: 'Get all plans including inactive (superadmin)' })
    getAllPlans() {
        return this.cmsService.getAllPlans();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('plans')
    @ApiOperation({ summary: 'Create a subscription plan (superadmin)' })
    createPlan(@Body() dto: CreatePlanDto) {
        return this.cmsService.createPlan(dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Put('plans/:id')
    @ApiOperation({ summary: 'Update a subscription plan (superadmin)' })
    updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
        return this.cmsService.updatePlan(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('plans/:id')
    @ApiOperation({ summary: 'Delete a subscription plan (superadmin)' })
    deletePlan(@Param('id') id: string) {
        return this.cmsService.deletePlan(id);
    }
}
