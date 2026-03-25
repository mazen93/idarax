import { DeliveryAggregatorService } from './delivery-aggregator.service';
export declare class DeliveryAggregatorController {
    private readonly service;
    constructor(service: DeliveryAggregatorService);
    handleWebhook(platform: string, payload: any): Promise<any>;
}
