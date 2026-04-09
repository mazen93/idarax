import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { BullModule } from '@nestjs/bull';
import { OrderProcessor } from './order.processor';
import { PreOrderProcessor } from './pre-order.processor';
import { InventoryModule } from '../retail/inventory/inventory.module';
import { OfferModule } from '../retail/offer/offer.module';
import { RefundService } from './refund.service';
import { InvoiceService } from './invoice.service';
import { StaffModule } from '../staff/staff.module';
import { NumberingService } from './numbering.service';
import { AuditLogModule } from '../common/audit-log/audit-log.module';
import { CrmModule } from '../crm/crm.module';
import { KdsModule } from '../restaurant/kds/kds.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DrovoModule } from '../delivery-aggregator/drovo.module';
import { ZatcaModule } from '../zatca/zatca.module';

@Module({
  imports: [PrismaModule, TenantModule, InventoryModule, OfferModule, StaffModule, AuditLogModule, CrmModule, KdsModule, MailModule, NotificationsModule,
    BullModule.registerQueue(
      { name: 'orders' },
      { name: 'pre-orders' },
    ),
    DrovoModule,
    ZatcaModule,
  ],
  providers: [OrderService, OrderProcessor, PreOrderProcessor, RefundService, NumberingService, InvoiceService],
  controllers: [OrderController],
  exports: [OrderService, RefundService, NumberingService, InvoiceService],
})
export class OrderModule { }
