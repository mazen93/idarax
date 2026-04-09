import { ZatcaOnboardingService } from './zatca-onboarding.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ZatcaController {
    private onboardingService;
    private prisma;
    constructor(onboardingService: ZatcaOnboardingService, prisma: PrismaService);
    updateSettings(req: any, dto: any): Promise<any>;
    onboard(req: any): Promise<any>;
    completeOnboarding(req: any, otp: string): Promise<any>;
}
