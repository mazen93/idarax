export declare class PusherService {
    private pusher;
    private readonly logger;
    constructor();
    trigger(channel: string | string[], event: string, data: any): Promise<void>;
}
