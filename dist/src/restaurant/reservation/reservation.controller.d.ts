import { ReservationService, WaitingService } from './reservation.service';
export declare class ReservationController {
    private readonly service;
    constructor(service: ReservationService);
    create(dto: any): Promise<any>;
    findAll(): Promise<any>;
    update(id: string, dto: any): Promise<any>;
    remove(id: string): Promise<any>;
}
export declare class WaitingController {
    private readonly service;
    constructor(service: WaitingService);
    create(dto: any): Promise<any>;
    findAll(): Promise<any>;
    update(id: string, dto: any): Promise<any>;
    remove(id: string): Promise<any>;
}
