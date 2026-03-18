import { CdsGateway } from './cds.gateway';
interface CartUpdateDto {
    terminalId: string;
    tenantId: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
}
interface SessionEventDto {
    terminalId: string;
    tenantId: string;
}
interface OrderCompleteDto extends SessionEventDto {
    orderNumber: number;
    total: number;
    currency: string;
}
export declare class CdsService {
    private readonly gateway;
    constructor(gateway: CdsGateway);
    updateCart(dto: CartUpdateDto): {
        ok: boolean;
    };
    startPayment(dto: SessionEventDto): {
        ok: boolean;
    };
    completeOrder(dto: OrderCompleteDto): {
        ok: boolean;
    };
    clearSession(dto: SessionEventDto): {
        ok: boolean;
    };
}
export {};
