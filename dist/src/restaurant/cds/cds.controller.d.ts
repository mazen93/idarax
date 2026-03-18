import { CdsService } from './cds.service';
export declare class CdsController {
    private readonly cdsService;
    constructor(cdsService: CdsService);
    updateCart(body: any): {
        ok: boolean;
    };
    startPayment(body: any): {
        ok: boolean;
    };
    completeOrder(body: any): {
        ok: boolean;
    };
    clearSession(body: any): {
        ok: boolean;
    };
}
