import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { UpsertLandingContentDto, CreatePlanDto, UpdatePlanDto, SelfRegisterDto, SubmitContactDto } from './dto/cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Landing Page CMS')
@Controller('cms')
export class CmsController {
    constructor(private readonly cmsService: CmsService) { }

    // ─── Public endpoints ─────────────────────────────────────────────────────────

    @Get('content')
    @ApiOperation({ summary: 'Get all landing page sections (public)' })
    getAllContent() { return this.cmsService.getAllContent(); }

    @Get('content/:section')
    @ApiOperation({ summary: 'Get a specific section (public)' })
    getContentBySection(@Param('section') section: string) {
        return this.cmsService.getContentBySection(section);
    }

    @Get('plans')
    @ApiOperation({ summary: 'Get active subscription plans (public)' })
    getActivePlans() { return this.cmsService.getActivePlans(); }

    @Post('register')
    @ApiOperation({ summary: 'Self-register a new tenant (public)' })
    selfRegister(@Body() dto: SelfRegisterDto) { return this.cmsService.selfRegister(dto); }

    @Post('contact')
    @ApiOperation({ summary: 'Submit a contact form message (public)' })
    submitContact(@Body() dto: SubmitContactDto) { return this.cmsService.submitContact(dto); }

    // ─── Superadmin-protected endpoints ──────────────────────────────────────────

    @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    @Put('content/:section')
    @ApiOperation({ summary: 'Upsert a landing page section (superadmin)' })
    upsertContent(@Param('section') section: string, @Body() dto: UpsertLandingContentDto) {
        return this.cmsService.upsertContent(section, dto);
    }

    @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    @Delete('content/:section')
    @ApiOperation({ summary: 'Delete a landing page section (superadmin)' })
    deleteContent(@Param('section') section: string) { return this.cmsService.deleteContent(section); }


    // ─── Contact Messages (admin-protected) ────────────────────────────────────────

    @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    @Get('admin/contact-messages')
    @ApiOperation({ summary: 'Get all contact form messages (superadmin)' })
    getContactMessages() { return this.cmsService.getContactMessages(); }

    @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    @Put('admin/contact-messages/:id/read')
    @ApiOperation({ summary: 'Mark a message as read (superadmin)' })
    markContactRead(@Param('id') id: string) { return this.cmsService.markContactRead(id); }

    @UseGuards(JwtAuthGuard) @ApiBearerAuth()
    @Delete('admin/contact-messages/:id')
    @ApiOperation({ summary: 'Delete a contact message (superadmin)' })
    deleteContactMessage(@Param('id') id: string) { return this.cmsService.deleteContactMessage(id); }
}
