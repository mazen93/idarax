"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TokenBlacklistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBlacklistService = void 0;
const common_1 = require("@nestjs/common");
const Redis = __importStar(require("ioredis"));
const BLACKLIST_PREFIX = 'token_blacklist:';
let TokenBlacklistService = TokenBlacklistService_1 = class TokenBlacklistService {
    redis;
    logger = new common_1.Logger(TokenBlacklistService_1.name);
    errorCount = 0;
    constructor() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = parseInt(process.env.REDIS_PORT || '6379');
        this.logger.log(`🔄 Initializing Redis connection to ${host}:${port}`);
        this.redis = new Redis.Redis({
            host,
            port,
            maxRetriesPerRequest: 0,
            enableOfflineQueue: false,
            connectTimeout: 5000,
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
    async blacklist(jti, ttlSeconds) {
        if (this.redis.status !== 'ready')
            return;
        try {
            await this.redis.set(`${BLACKLIST_PREFIX}${jti}`, '1', 'EX', ttlSeconds);
        }
        catch (err) {
            this.logger.warn(`Failed to blacklist token ${jti}: ${err.message}`);
        }
    }
    async isBlacklisted(jti) {
        if (this.redis.status !== 'ready')
            return false;
        try {
            const result = await this.redis.get(`${BLACKLIST_PREFIX}${jti}`);
            return result !== null;
        }
        catch (err) {
            this.logger.warn(`Blacklist check failed for ${jti}, failing open: ${err.message}`);
            return false;
        }
    }
};
exports.TokenBlacklistService = TokenBlacklistService;
exports.TokenBlacklistService = TokenBlacklistService = TokenBlacklistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TokenBlacklistService);
//# sourceMappingURL=token-blacklist.service.js.map