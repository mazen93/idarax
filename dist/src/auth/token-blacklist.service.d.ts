export declare class TokenBlacklistService {
    private readonly redis;
    private readonly logger;
    private errorCount;
    constructor();
    blacklist(jti: string, ttlSeconds: number): Promise<void>;
    isBlacklisted(jti: string): Promise<boolean>;
}
