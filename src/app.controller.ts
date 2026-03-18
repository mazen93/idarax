import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('seed-data')
  async seedData() {
    const tenantId = 'test-tenant-id';
    const mainBranchId = 'main-branch-id';

    // This is a quick hack to seed while Prisma Client is blocked on local env
    const prisma = (this as any).prismaService || (this as any).prisma;
    // Actually let's just use the injected service if possible, but AppController doesn't have it by default.
    return { message: 'Use the following curl to create your first tenant and category via API' };
  }
}
