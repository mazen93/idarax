import { CmsService } from './cms.service';
import { UpsertLandingContentDto, CreatePlanDto, UpdatePlanDto, SelfRegisterDto, SubmitContactDto } from './dto/cms.dto';
export declare class CmsController {
    private readonly cmsService;
    constructor(cmsService: CmsService);
    getAllContent(): Promise<any>;
    getContentBySection(section: string): Promise<any>;
    getActivePlans(): Promise<any>;
    selfRegister(dto: SelfRegisterDto): Promise<any>;
    submitContact(dto: SubmitContactDto): Promise<any>;
    upsertContent(section: string, dto: UpsertLandingContentDto): Promise<any>;
    deleteContent(section: string): Promise<any>;
    getAllPlans(): Promise<any>;
    createPlan(dto: CreatePlanDto): Promise<any>;
    updatePlan(id: string, dto: UpdatePlanDto): Promise<any>;
    deletePlan(id: string): Promise<any>;
    getContactMessages(): Promise<any>;
    markContactRead(id: string): Promise<any>;
    deleteContactMessage(id: string): Promise<any>;
}
