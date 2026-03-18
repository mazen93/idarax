import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as Redis from 'ioredis';

const BLACKLIST_PREFIX = 'token_blacklist:';

@Injectable()
export class TokenBlacklistService {
    private readonly redis: Redis.Redis;
    private readonly logger = new Logger(TokenBlacklistService.name);

    private errorCount = 0;

    constructor() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT || '6379');
        
        this.logger.log(`🔄 Initializing Redis connection to ${host}:${port}`);
        
        this.redis = new Redis.Redis({
            host,
            port,
            maxRetriesPerRequest: 0,
            enableOfflineQueue: false,
            connectTimeout: 5000, // Increased timeout to 5s
            retryStrategy: (times) => {
                const delay = Math.min(times * 2000, 30000);
                return delay;
            },
        });

        this.redis.on('error', (err) => {
            this.errorCount++;
            if (this.errorCount % 10 === 1) {
                this.logger.error(`Redis connection error [${host}:${port}]: ${err.message || 'Unknown error'} (Attempt ${this.errorCount})`);
            }
        });

        this.redis.on('connect', () => {
            this.errorCount = 0;
            this.logger.log(`✅ Successfully connected to Redis at ${host}:${port}`);
        });
    }

    /**
     * Blacklists a JWT by its JTI (JWT ID).
     * The token will be rejected for the duration of its TTL.
     * @param jti - The unique JWT ID claim
     * @param ttlSeconds - How long to keep the token blacklisted (should match the token's remaining lifespan)
     */
    async blacklist(jti: string, ttlSeconds: number): Promise<void> {
        if (this.redis.status !== 'ready') return;
        try {
            await this.redis.set(`${BLACKLIST_PREFIX}${jti}`, '1', 'EX', ttlSeconds);
        } catch (err) {
            this.logger.warn(`Failed to blacklist token ${jti}: ${err.message}`);
        }
    }

    /**
     * Check if a JTI is blacklisted (i.e., the token was revoked / logged out).
     * @param jti - The JWT ID to check
     */
    async isBlacklisted(jti: string): Promise<boolean> {
        if (this.redis.status !== 'ready') return false; // Fail open
        try {
            const result = await this.redis.get(`${BLACKLIST_PREFIX}${jti}`);
            return result !== null;
        } catch (err) {
            this.logger.warn(`Blacklist check failed for ${jti}, failing open: ${err.message}`);
            return false; // Fail open
        }
    }
}
