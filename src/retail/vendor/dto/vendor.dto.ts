export class CreateVendorDto {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export class UpdateVendorDto {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export class LinkProductDto {
    productId: string;
    costPrice: number;
}
