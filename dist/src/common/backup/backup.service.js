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
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    logger = new common_1.Logger(BackupService_1.name);
    backupDir = path.join(process.cwd(), 'backups');
    retentionDays = 14;
    constructor() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    async handleCron() {
        this.logger.log('Starting scheduled daily backup...');
        await this.runBackup();
        await this.cleanupOldBackups();
    }
    async runBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `idarax-backup-${timestamp}.sql.gz`;
        const outputPath = path.join(this.backupDir, filename);
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            this.logger.error('DATABASE_URL not found in environment');
            return;
        }
        try {
            const command = `pg_dump "${dbUrl}" | gzip > "${outputPath}"`;
            this.logger.log(`Executing backup to ${filename}...`);
            await execPromise(command);
            this.logger.log(`Backup completed successfully: ${filename}`);
            return { filename, path: outputPath };
        }
        catch (error) {
            this.logger.error(`Backup failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async cleanupOldBackups() {
        this.logger.log(`Cleaning up backups older than ${this.retentionDays} days...`);
        try {
            const files = fs.readdirSync(this.backupDir);
            const now = new Date().getTime();
            const expirationMs = this.retentionDays * 24 * 60 * 60 * 1000;
            for (const file of files) {
                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                const fileAgeMs = now - stats.mtime.getTime();
                if (fileAgeMs > expirationMs) {
                    this.logger.log(`Deleting expired backup: ${file}`);
                    fs.unlinkSync(filePath);
                }
            }
        }
        catch (error) {
            this.logger.error(`Cleanup failed: ${error.message}`);
        }
    }
    getBackups() {
        return fs.readdirSync(this.backupDir).map(file => {
            const stats = fs.statSync(path.join(this.backupDir, file));
            return {
                filename: file,
                size: stats.size,
                createdAt: stats.mtime
            };
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
};
exports.BackupService = BackupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupService.prototype, "handleCron", null);
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BackupService);
//# sourceMappingURL=backup.service.js.map