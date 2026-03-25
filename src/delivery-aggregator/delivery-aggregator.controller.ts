import { Controller, Post, Param, Body } from '@nestjs/common';
import { DeliveryAggregatorService } from './delivery-aggregator.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Delivery Aggregator')
@Controller('delivery-aggregator')
export class DeliveryAggregatorController {
    constructor(private readonly service: DeliveryAggregatorService) { }

    @Post('webhook/:platform')
    @ApiOperation({ summary: 'Receive order webhooks from Talabat, Deliveroo, UberEats' })
    handleWebhook(@Param('platform') platform: string, @Body() payload: any) {
        return this.service.handleWebhook(platform, payload);
    }
}
