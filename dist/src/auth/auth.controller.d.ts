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
        isTenantActive: boolean;
        tenantStatus: string;
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
        isTenantActive: boolean;
        tenantStatus: string;
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
        isTenantActive: boolean;
        tenantStatus: string;
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
        isTenantActive: boolean;
        tenantStatus: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        tenantId: string;
        branchId: string | null;
        permissions: any[];
        features: string[];
        isTenantActive: boolean;
        tenantStatus: string;
    }>;
    verifyOverride(dto: VerifyOverrideDto): Promise<{
        override_token: string;
        managerName: string;
    }>;
}
