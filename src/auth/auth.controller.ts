import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, PinLoginDto, RefreshTokenDto, VerifyOverrideDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @ApiOperation({ summary: 'Log in and get JWT token' })
    @ApiResponse({ status: 200, description: 'Return JWT access token.' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('pin-login')
    @Throttle({ default: { ttl: 60000, limit: 10 } })
    @ApiOperation({ summary: 'Log in using PIN (for POS quick access)' })
    @ApiResponse({ status: 200, description: 'Return JWT access token.' })
    loginByPin(@Body() dto: PinLoginDto) {
        return this.authService.loginByPin(dto);
    }

    @Post('refresh')
    @SkipThrottle()
    @ApiOperation({ summary: 'Refresh JWT access token' })
    @ApiResponse({ status: 200, description: 'Return new JWT access and refresh tokens.' })
    refreshToken(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshToken(dto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Logout and invalidate the current access token' })
    @ApiResponse({ status: 200, description: 'Token revoked successfully.' })
    logout(@Request() req: any) {
        const token = req.headers.authorization?.split(' ')[1];
        return this.authService.logout(
            token || '',
            req.user?.id,
            req.user?.email,
            req.user?.tenantId,
        );
    }

    @Get('me')
    @SkipThrottle()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user profile and fresh features from DB' })
    getMe(@Request() req: any) {
        return this.authService.getMe(req.user?.id);
    }

    @Post('verify-override')
    @ApiOperation({ summary: 'Verify Manager PIN for an override action' })
    @ApiResponse({ status: 200, description: 'Return short-lived override token.' })
    verifyOverride(@Body() dto: VerifyOverrideDto) {
        return this.authService.verifyOverride(dto);
    }
}
