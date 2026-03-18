import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CdsService } from './cds.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Permissions } from '../../auth/permissions.decorator';
import { Actions } from '../../auth/permissions.constants';

@Controller('restaurant/cds')
@UseGuards(JwtAuthGuard)
export class CdsController {
    constructor(private readonly cdsService: CdsService) { }

    /** Called by POS when cart items change */
    @Post('session/update')
    @Permissions(Actions.POS.ACCESS)
    updateCart(@Body() body: any) {
        return this.cdsService.updateCart(body);
    }

    /** Called by POS when customer taps "Checkout" */
    @Post('session/payment')
    @Permissions(Actions.POS.ACCESS)
    startPayment(@Body() body: any) {
        return this.cdsService.startPayment(body);
    }

    /** Called by POS when order is successfully completed */
    @Post('session/complete')
    @Permissions(Actions.POS.ACCESS)
    completeOrder(@Body() body: any) {
        return this.cdsService.completeOrder(body);
    }

    /** Called by POS when cart is cleared or new session begins */
    @Post('session/clear')
    @Permissions(Actions.POS.ACCESS)
    clearSession(@Body() body: any) {
        return this.cdsService.clearSession(body);
    }
}
