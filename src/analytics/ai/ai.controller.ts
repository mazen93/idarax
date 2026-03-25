import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics/ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Get('forecast/:productId')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    @ApiOperation({ summary: 'Forecast stock depletion for a product' })
    forecast(@Param('productId') productId: string) {
        return this.aiService.forecastStock(productId);
    }

    @Get('recommendations/:productId')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    @ApiOperation({ summary: 'Get frequently bought together products' })
    recommendations(@Param('productId') productId: string) {
        return this.aiService.getRecommendations(productId);
    }

    @Get('revenue-forecast')
    @Permissions(Actions.REPORTS.VIEW_ALL)
    @ApiOperation({ summary: 'Predict revenue for next few days' })
    revenueForecast() {
        return this.aiService.predictRevenue(7);
    }

    @Get('upsell')
    @Permissions(Actions.POS.ACCESS)
    @ApiOperation({ summary: 'Get frequently bought together products for cart upselling' })
    upsell(@Query('productIds') productIds: string) {
        const idsArray = productIds ? productIds.split(',').map(id => id.trim()).filter(id => id) : [];
        return this.aiService.getUpsellRecommendations(idsArray);
    }

    @Get('inventory-predictions')
    @Permissions(Actions.INVENTORY.VIEW)
    @ApiOperation({ summary: 'Get predictive inventory recommendations' })
    inventoryPredictions() {
        return this.aiService.getInventoryPredictions();
    }
}
