export declare enum BreakType {
    LUNCH = "LUNCH",
    SHORT = "SHORT",
    OTHER = "OTHER"
}
export declare class ClockInDto {
    note?: string;
    branchId?: string;
}
export declare class StartBreakDto {
    type: BreakType;
}
export declare class ClockOutDto {
    note?: string;
}
