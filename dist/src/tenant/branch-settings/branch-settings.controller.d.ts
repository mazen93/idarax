import { BranchSettingsService } from './branch-settings.service';
import { UpdateBranchSettingsDto } from './dto/branch-settings.dto';
export declare class BranchSettingsController {
    private readonly branchSettingsService;
    constructor(branchSettingsService: BranchSettingsService);
    getByBranch(branchId: string): Promise<any>;
    upsert(branchId: string, dto: UpdateBranchSettingsDto): Promise<any>;
}
