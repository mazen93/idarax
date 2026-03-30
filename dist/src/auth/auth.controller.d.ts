import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, PinLoginDto, RefreshTokenDto, VerifyOverrideDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
        features: string[];
        isExpired: boolean;
        daysRemaining: number;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
        features: string[];
        isExpired: boolean;
        daysRemaining: number;
    }>;
    loginByPin(dto: PinLoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
        features: string[];
        isExpired: boolean;
        daysRemaining: number;
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
        tenantId: string;
        branchId: string | null;
        role: string;
        name: string;
        permissions: string[];
        features: string[];
        isExpired: boolean;
        daysRemaining: number;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    verifyOverride(dto: VerifyOverrideDto): Promise<{
        override_token: string;
        managerName: string;
    }>;
}
