export declare class UpsertLandingContentDto {
    title: string;
    content?: string;
    items?: any;
    theme?: string;
}
export declare class CreatePlanDto {
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    price: number;
    features: string[];
    featuresAr?: string[];
}
export declare class UpdatePlanDto {
    name?: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    price?: number;
    features?: string[];
    featuresAr?: string[];
    isActive?: boolean;
}
export declare class SelfRegisterDto {
    tenantName: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    planId?: string;
    type?: string;
}
export declare class SubmitContactDto {
    name: string;
    email: string;
    phone?: string;
    message: string;
}
