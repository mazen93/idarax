export declare class OpenDrawerDto {
    openingBalance: number;
    note?: string;
    branchId?: string;
}
export declare class CloseDrawerDto {
    closingBalance: number;
    note?: string;
}
export declare enum CashMovementType {
    CASH_IN = "CASH_IN",
    CASH_OUT = "CASH_OUT",
    SALE = "SALE",
    REFUND = "REFUND"
}
export declare class AddMovementDto {
    amount: number;
    type: CashMovementType;
    reason?: string;
    referenceId?: string;
}
