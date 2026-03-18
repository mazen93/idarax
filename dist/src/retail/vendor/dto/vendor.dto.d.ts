export declare class CreateVendorDto {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}
export declare class UpdateVendorDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}
export declare class LinkProductDto {
    productId: string;
    costPrice: number;
}
