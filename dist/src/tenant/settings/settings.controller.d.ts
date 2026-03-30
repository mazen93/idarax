import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    get(): Promise<any>;
    update(dto: UpdateSettingsDto): Promise<any>;
}
