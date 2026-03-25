import { CrmService } from './crm.service';
import { CreateCustomerDto, UpdateCustomerDto, LoyaltyTransactionDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, PaginationQueryDto } from './dto/crm.dto';
export declare class CrmController {
    private readonly crmService;
    constructor(crmService: CrmService);
    create(dto: CreateCustomerDto): Promise<any>;
    findAll(query: PaginationQueryDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateCustomerDto): Promise<any>;
    delete(id: string): Promise<any>;
    addTransaction(dto: LoyaltyTransactionDto): Promise<any>;
    createAddress(dto: CreateCustomerAddressDto): Promise<any>;
    updateAddress(id: string, dto: UpdateCustomerAddressDto): Promise<any>;
    deleteAddress(id: string): Promise<any>;
    getActiveCampaigns(): Promise<any>;
}
