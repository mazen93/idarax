import { Module } from '@nestjs/common';
import { ZatcaTlvService } from './zatca-tlv.service';
import { ZatcaXmlService } from './zatca-xml.service';
import { ZatcaCryptoService } from './zatca-crypto.service';
import { ZatcaReportingService } from './zatca-reporting.service';
import { ZatcaOnboardingService } from './zatca-onboarding.service';
import { ZatcaController } from './zatca.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ZatcaController],
  providers: [
    ZatcaTlvService,
    ZatcaXmlService,
    ZatcaCryptoService,
    ZatcaReportingService,
    ZatcaOnboardingService,
  ],
  exports: [
    ZatcaTlvService,
    ZatcaXmlService,
    ZatcaCryptoService,
    ZatcaReportingService,
    ZatcaOnboardingService,
  ],
})
export class ZatcaModule {}
