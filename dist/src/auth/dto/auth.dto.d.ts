export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    tenantId: string;
    role?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class PinLoginDto {
    pin: string;
    tenantId: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class VerifyOverrideDto {
    pin: string;
    tenantId: string;
    action: string;
}
