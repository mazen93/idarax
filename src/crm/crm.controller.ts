import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateCustomerDto, UpdateCustomerDto, LoyaltyTransactionDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, PaginationQueryDto } from './dto/crm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';
import { RequiresFeature } from '../auth/subscription.decorator';
import { SubscriptionGuard } from '../auth/subscription.guard';

@Controller('crm')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresFeature('CRM')
export class CrmController {
    constructor(private readonly crmService: CrmService) { }

    @Post('customers')
    @Permissions(Actions.CUSTOMERS.CREATE)
    create(@Body() dto: CreateCustomerDto) {
        return this.crmService.createCustomer(dto);
    }

    @Get('customers')
    @Permissions(Actions.CUSTOMERS.VIEW)
    findAll(@Query() query: PaginationQueryDto) {
        return this.crmService.getCustomers(query);
    }

    @Get('customers/:id')
    @Permissions(Actions.CUSTOMERS.VIEW)
    findOne(@Param('id') id: string) {
        return this.crmService.getCustomerById(id);
    }

    @Patch('customers/:id')
    @Permissions(Actions.CUSTOMERS.EDIT)
    update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.crmService.updateCustomer(id, dto);
    }

    @Delete('customers/:id')
    @Permissions(Actions.CUSTOMERS.DELETE)
    delete(@Param('id') id: string) {
        return this.crmService.deleteCustomer(id);
    }

    @Post('loyalty/transaction')
    @Permissions(Actions.CUSTOMERS.EDIT) // Assume managing loyalty is part of editing a customer
    addTransaction(@Body() dto: LoyaltyTransactionDto) {
        return this.crmService.addLoyaltyTransaction(dto);
    }

    @Post('addresses')
    @Permissions(Actions.CUSTOMERS.EDIT) // Managing addresses overlaps with editing a customer
    createAddress(@Body() dto: CreateCustomerAddressDto) {
        return this.crmService.createAddress(dto);
    }

    @Patch('addresses/:id')
    @Permissions(Actions.CUSTOMERS.EDIT)
    updateAddress(@Param('id') id: string, @Body() dto: UpdateCustomerAddressDto) {
        return this.crmService.updateAddress(id, dto);
    }

    @Delete('addresses/:id')
    @Permissions(Actions.CUSTOMERS.EDIT)
    deleteAddress(@Param('id') id: string) {
        return this.crmService.deleteAddress(id);
    }

    @Get('campaigns/active')
    @Permissions(Actions.CUSTOMERS.VIEW)
    getActiveCampaigns() {
        return this.crmService.getActiveCampaigns();
    }

    @Get('addresses/:id/estimate-fee')
    @Permissions(Actions.CUSTOMERS.VIEW)
    estimateFee(@Param('id') id: string) {
        return this.crmService.estimateDeliveryFee(id);
    }

    // --- Customer Segmentation Endpoints ---

    @Post('segments')
    @Permissions(Actions.CUSTOMERS.CREATE)
    createSegment(@Body() dto: any) {
        return this.crmService.createSegment(dto);
    }

    @Get('segments')
    @Permissions(Actions.CUSTOMERS.VIEW)
    getSegments() {
        return this.crmService.getSegments();
    }

    @Patch('segments/:id')
    @Permissions(Actions.CUSTOMERS.EDIT)
    updateSegment(@Param('id') id: string, @Body() dto: any) {
        return this.crmService.updateSegment(id, dto);
    }

    @Delete('segments/:id')
    @Permissions(Actions.CUSTOMERS.DELETE)
    deleteSegment(@Param('id') id: string) {
        return this.crmService.deleteSegment(id);
    }

    @Post('segments/:id/assign')
    @Permissions(Actions.CUSTOMERS.EDIT)
    assignCustomersToSegment(@Param('id') id: string, @Body() dto: { customerIds: string[] }) {
        return this.crmService.assignCustomersToSegment(id, dto.customerIds);
    }

    // --- Reward Catalog Endpoints ---

    @Post('rewards')
    @Permissions(Actions.CUSTOMERS.CREATE)
    createRewardCatalogItem(@Body() dto: any) {
        return this.crmService.createRewardCatalogItem(dto);
    }

    @Get('rewards')
    @Permissions(Actions.CUSTOMERS.VIEW)
    getRewardCatalogItems() {
        return this.crmService.getRewardCatalogItems();
    }

    @Patch('rewards/:id')
    @Permissions(Actions.CUSTOMERS.EDIT)
    updateRewardCatalogItem(@Param('id') id: string, @Body() dto: any) {
        return this.crmService.updateRewardCatalogItem(id, dto);
    }

    @Delete('rewards/:id')
    @Permissions(Actions.CUSTOMERS.DELETE)
    deleteRewardCatalogItem(@Param('id') id: string) {
        return this.crmService.deleteRewardCatalogItem(id);
    }
}

