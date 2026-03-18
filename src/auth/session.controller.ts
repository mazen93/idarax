import { Controller, Get, Delete, Param, UseGuards, Request, HttpCode } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@SkipThrottle()
@Controller('auth/sessions')
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Get()
    @ApiOperation({ summary: 'List all active sessions (devices) for the authenticated user' })
    getMySessions(@Request() req: any) {
        return this.sessionService.getUserSessions(req.user.id);
    }

    @Delete('all')
    @HttpCode(200)
    @ApiOperation({ summary: 'Logout from all devices (revoke all sessions)' })
    @ApiResponse({ status: 200, description: 'All sessions revoked.' })
    revokeAll(@Request() req: any) {
        return this.sessionService.revokeAllSessions(req.user.id);
    }

    @Delete(':jti')
    @HttpCode(200)
    @ApiOperation({ summary: 'Revoke a specific session by its JTI (logout from one device)' })
    @ApiResponse({ status: 200, description: 'Session revoked.' })
    revokeOne(@Param('jti') jti: string, @Request() req: any) {
        return this.sessionService.revokeSession(jti, req.user.id);
    }
}
