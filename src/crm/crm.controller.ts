import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateCustomerDto, UpdateCustomerDto, LoyaltyTransactionDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, PaginationQueryDto } from './dto/crm.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/permissions.decorator';
import { Actions } from '../auth/permissions.constants';

@Controller('crm')
@UseGuards(JwtAuthGuard)
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
}
