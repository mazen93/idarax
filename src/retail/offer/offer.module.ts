import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController, SeedOfferController } from './offer.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
    imports: [PrismaModule, TenantModule],
    controllers: [OfferController, SeedOfferController],
    providers: [OfferService],
    exports: [OfferService]
})
export class OfferModule { }
