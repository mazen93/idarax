import { SessionService } from './session.service';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    getMySessions(req: any): Promise<any>;
    revokeAll(req: any): Promise<{
        message: string;
    }>;
    revokeOne(jti: string, req: any): Promise<{
        message: string;
        jti?: undefined;
    } | {
        message: string;
        jti: string;
    }>;
}
