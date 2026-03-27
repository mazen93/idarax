import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private readonly retentionDays = 14;

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    this.logger.log('Starting scheduled daily backup...');
    await this.runBackup();
    await this.cleanupOldBackups();
  }

  async runBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `idarax-backup-${timestamp}.sql.gz`;
    const outputPath = path.join(this.backupDir, filename);

    // Get DB config from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      this.logger.error('DATABASE_URL not found in environment');
      return;
    }

    try {
      // Use pg_dump via connection string and pipe to gzip
      // Note: pg_dump must be in the system PATH
      const command = `pg_dump "${dbUrl}" | gzip > "${outputPath}"`;
      
      this.logger.log(`Executing backup to ${filename}...`);
      await execPromise(command);
      this.logger.log(`Backup completed successfully: ${filename}`);
      
      return { filename, path: outputPath };
    } catch (error) {
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
    } catch (error) {
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
}
