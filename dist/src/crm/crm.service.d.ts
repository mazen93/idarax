import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { CreateCustomerDto, UpdateCustomerDto, LoyaltyTransactionDto, CreateCustomerAddressDto, UpdateCustomerAddressDto, PaginationQueryDto } from './dto/crm.dto';
import { DrovoService } from '../delivery-aggregator/drovo.service';
export declare class CrmService {
    private prisma;
    private tenantService;
    private drovoService;
    constructor(prisma: PrismaService, tenantService: TenantService, drovoService: DrovoService);
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
    processLoyaltyForOrder(customerId: string, orderAmount: number, orderId: string, prisma?: any): Promise<any>;
    getActiveCampaigns(): Promise<any>;
    estimateDeliveryFee(addressId: string): Promise<any>;
    createSegment(dto: any): Promise<any>;
    getSegments(): Promise<any>;
    updateSegment(id: string, dto: any): Promise<any>;
    deleteSegment(id: string): Promise<any>;
    assignCustomersToSegment(segmentId: string, customerIds: string[]): Promise<any>;
    createRewardCatalogItem(dto: any): Promise<any>;
    getRewardCatalogItems(): Promise<any>;
    updateRewardCatalogItem(id: string, dto: any): Promise<any>;
    deleteRewardCatalogItem(id: string): Promise<any>;
}
