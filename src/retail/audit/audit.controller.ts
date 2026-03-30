import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { StartAuditDto, UpdateAuditDto } from './dto/audit.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Post('start')
    @ApiOperation({ summary: 'Start a new stock audit session' })
    async start(@Body() dto: StartAuditDto) {
        return this.auditService.startAudit(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all audit sessions' })
    async findAll() {
        return this.auditService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get details of an audit session' })
    async findOne(@Param('id') id: string) {
        return this.auditService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update physical quantities in a PENDING audit' })
    async update(@Param('id') id: string, @Body() dto: UpdateAuditDto) {
        return this.auditService.updateAudit(id, dto);
    }

    @Post(':id/commit')
    @ApiOperation({ summary: 'Commit an audit session and update inventory levels' })
    async commit(@Param('id') id: string) {
        return this.auditService.commitAudit(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel a PENDING audit session' })
    async cancel(@Param('id') id: string) {
        return this.auditService.cancelAudit(id);
    }
}
