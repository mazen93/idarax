import type { Response } from 'express';
import { ImportService } from './import.service';
export declare class ImportController {
    private readonly importService;
    constructor(importService: ImportService);
    importProducts(file: Express.Multer.File, mode?: 'OVERRIDE' | 'SKIP_EXISTING'): Promise<import("./import.service").ImportResults>;
    importCustomers(file: Express.Multer.File, mode?: 'OVERRIDE' | 'SKIP_EXISTING'): Promise<import("./import.service").ImportResults>;
    exportProducts(res: Response): Promise<void>;
}
