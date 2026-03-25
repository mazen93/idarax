export declare enum NotificationType {
    ORDER_READY = "ORDER_READY",
    LOW_STOCK = "LOW_STOCK",
    ORDER_CANCELLED = "ORDER_CANCELLED",
    ORDER_VOIDED = "ORDER_VOIDED",
    MANAGER_ALERT = "MANAGER_ALERT"
}
export declare class CreateNotificationDto {
    type: NotificationType;
    title: string;
    message: string;
    branchId?: string;
    meta?: Record<string, any>;
}
export declare class MarkReadDto {
    ids: string[];
}
