export declare class UpsertLandingContentDto {
    title: string;
    content?: string;
    items?: any;
}
export declare class CreatePlanDto {
    name: string;
    price: number;
    features: string[];
}
export declare class UpdatePlanDto {
    name?: string;
    price?: number;
    features?: string[];
    isActive?: boolean;
}
export declare class SelfRegisterDto {
    tenantName: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    planId?: string;
}
