import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateCustomerDto, UpdateCustomerDto, LoyaltyTransactionDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, PaginationQueryDto } from './dto/crm.dto';
export declare class CrmService {
    private prisma;
    private tenantService;
    constructor(prisma: PrismaService, tenantService: TenantService);
    createCustomer(dto: CreateCustomerDto): Promise<any>;
    getCustomers(query: PaginationQueryDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            lastPage: number;
        };
    }>;
    getCustomerById(id: string, prisma?: any): Promise<any>;
    updateCustomer(id: string, dto: UpdateCustomerDto): Promise<any>;
    deleteCustomer(id: string): Promise<any>;
    addLoyaltyTransaction(dto: LoyaltyTransactionDto): Promise<any>;
    createAddress(dto: CreateCustomerAddressDto): Promise<any>;
    updateAddress(id: string, dto: UpdateCustomerAddressDto): Promise<any>;
    deleteAddress(id: string): Promise<any>;
    processLoyaltyForOrder(customerId: string, orderAmount: number, orderId: string): Promise<any>;
    getActiveCampaigns(): Promise<any>;
}
