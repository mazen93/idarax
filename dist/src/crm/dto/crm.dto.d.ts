export declare class AddressDto {
    id?: string;
    label?: string;
    address: string;
    isDefault?: boolean;
    lat?: number;
    lng?: number;
}
export declare class CreateCustomerDto {
    name: string;
    email?: string;
    phone: string;
    birthday?: Date;
    referredByCode?: string;
    addresses?: AddressDto[];
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
    phone?: string;
    birthday?: Date;
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
    lat?: number;
    lng?: number;
}
export declare class UpdateCustomerAddressDto {
    label?: string;
    address?: string;
    isDefault?: boolean;
    lat?: number;
    lng?: number;
}
export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    segmentId?: string;
}
export declare class CreateSegmentDto {
    name: string;
    description?: string;
    color?: string;
}
export declare class UpdateSegmentDto {
    name?: string;
    description?: string;
    color?: string;
}
export declare class AssignCustomersDto {
    customerIds: string[];
}
