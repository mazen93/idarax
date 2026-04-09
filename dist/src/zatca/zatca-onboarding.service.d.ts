import { PrismaService } from '../prisma/prisma.service';
import { ZatcaCryptoService } from './zatca-crypto.service';
export declare class ZatcaOnboardingService {
    private prisma;
    private cryptoService;
    private readonly logger;
    constructor(prisma: PrismaService, cryptoService: ZatcaCryptoService);
    onboardDevice(tenantId: string, branchId?: string): Promise<any>;
    completeOnboarding(tenantId: string, otp: string): Promise<any>;
}
