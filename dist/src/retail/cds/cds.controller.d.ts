import { PusherService } from '../../notifications/pusher.service';
import { AiService } from '../../analytics/ai/ai.service';
import * as express from 'express';
export declare class CdsController {
    private readonly pusherService;
    private readonly aiService;
    constructor(pusherService: PusherService, aiService: AiService);
    syncCart(req: express.Request, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    checkoutState(req: express.Request, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
