export declare class AddressDto {
    id?: string;
    label?: string;
    address: string;
    isDefault?: boolean;
}
export declare class CreateCustomerDto {
    name: string;
    email?: string;
    phone: string;
    addresses?: AddressDto[];
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
    phone?: string;
    addresses?: AddressDto[];
}
export declare class LoyaltyTransactionDto {
    customerId: string;
    points: number;
    type: 'EARNED' | 'REDEEMED';
    description?: string;
}
export declare class CreateCustomerAddressDto {
    customerId: string;
    label?: string;
    address: string;
    isDefault?: boolean;
}
export declare class UpdateCustomerAddressDto {
    label?: string;
    address?: string;
    isDefault?: boolean;
}
export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
    search?: string;
}
