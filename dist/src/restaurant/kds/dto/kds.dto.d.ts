export declare class CreateKitchenStationDto {
    name: string;
    staffIds?: string[];
}
export declare class CreateOrderItemDto {
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    stationId?: string;
}
export declare class UpdateOrderItemStatusDto {
    status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
    staff_pin?: string;
}
export declare class AssignStaffDto {
    staffIds: string[];
}
