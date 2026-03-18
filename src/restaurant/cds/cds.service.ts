import { Injectable } from '@nestjs/common';
import { CdsGateway } from './cds.gateway';

interface CartUpdateDto {
    terminalId: string;
    tenantId: string;
    items: Array<{ name: string; quantity: number; price: number }>;
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

@Injectable()
export class CdsService {
    constructor(private readonly gateway: CdsGateway) { }

    updateCart(dto: CartUpdateDto) {
        this.gateway.broadcastCartUpdate(dto.tenantId, dto.terminalId, {
            items: dto.items,
            subtotal: dto.subtotal,
            tax: dto.tax,
            discount: dto.discount,
            total: dto.total,
            currency: dto.currency,
        });
        return { ok: true };
    }

    startPayment(dto: SessionEventDto) {
        this.gateway.broadcastPaymentProcessing(dto.tenantId, dto.terminalId);
        return { ok: true };
    }

    completeOrder(dto: OrderCompleteDto) {
        this.gateway.broadcastOrderComplete(dto.tenantId, dto.terminalId, {
            orderNumber: dto.orderNumber,
            total: dto.total,
            currency: dto.currency,
        });
        return { ok: true };
    }

    clearSession(dto: SessionEventDto) {
        this.gateway.broadcastSessionCleared(dto.tenantId, dto.terminalId);
        return { ok: true };
    }
}
