export declare class CreateMenuDto {
    name: string;
    nameAr?: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    branchId?: string;
    categoryIds: string[];
}
export declare class UpdateMenuDto {
    name?: string;
    nameAr?: string;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
    categoryIds?: string[];
}
