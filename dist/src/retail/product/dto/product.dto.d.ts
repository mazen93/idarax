export declare class CreateVariantDto {
    name: string;
    price?: number;
    costPrice?: number;
    sku?: string;
}
export declare class UpdateVariantDto {
    id?: string;
    name: string;
    price?: number;
    costPrice?: number;
    sku?: string;
}
export declare class CreateRecipeComponentDto {
    ingredientId: string;
    variantId?: string;
    quantity: number;
    unit?: string;
}
export declare class CreateModifierOptionDto {
    name: string;
    priceAdjust?: number;
    sortOrder?: number;
}
export declare class CreateModifierGroupDto {
    name: string;
    required?: boolean;
    multiSelect?: boolean;
    sortOrder?: number;
    options?: CreateModifierOptionDto[];
}
export declare class CreateProductDto {
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    price: number;
    costPrice?: number;
    isSellable?: boolean;
    sku?: string;
    barcode?: string;
    productType?: 'STANDARD' | 'COMBO' | 'RAW_MATERIAL';
    categoryId: string;
    variants?: CreateVariantDto[];
    recipeComponents?: CreateRecipeComponentDto[];
    modifiers?: CreateModifierGroupDto[];
    defaultStationId?: string;
}
export declare class UpdateProductDto {
    name?: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    price?: number;
    costPrice?: number;
    isSellable?: boolean;
    sku?: string;
    barcode?: string;
    productType?: 'STANDARD' | 'COMBO' | 'RAW_MATERIAL';
    categoryId?: string;
    variants?: UpdateVariantDto[];
    recipeComponents?: CreateRecipeComponentDto[];
    defaultStationId?: string;
}
