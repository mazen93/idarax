export declare class CreateTableDto {
    number: number;
    capacity: number;
    sectionId?: string;
}
export declare class UpdateTableDto {
    number?: number;
    capacity?: number;
    status?: string;
    sectionId?: string;
    isMerged?: boolean;
    parentTableId?: string;
}
