import { PrismaService } from '../prisma/prisma.service';
import { UpsertLandingContentDto, CreatePlanDto, UpdatePlanDto, SelfRegisterDto, SubmitContactDto } from './dto/cms.dto';
export declare class CmsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllContent(): Promise<any>;
    getContentBySection(section: string): Promise<any>;
    upsertContent(section: string, dto: UpsertLandingContentDto): Promise<any>;
    deleteContent(section: string): Promise<any>;
    getActivePlans(): Promise<any>;
    getAllPlans(): Promise<any>;
    createPlan(dto: CreatePlanDto): Promise<any>;
    updatePlan(id: string, dto: UpdatePlanDto): Promise<any>;
    deletePlan(id: string): Promise<any>;
    selfRegister(dto: SelfRegisterDto): Promise<any>;
    submitContact(dto: SubmitContactDto): Promise<any>;
    getContactMessages(): Promise<any>;
    markContactRead(id: string): Promise<any>;
    deleteContactMessage(id: string): Promise<any>;
}
