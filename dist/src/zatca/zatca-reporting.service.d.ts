import { PrismaService } from '../prisma/prisma.service';
import { ZatcaXmlService } from './zatca-xml.service';
import { ZatcaCryptoService } from './zatca-crypto.service';
import { ZatcaTlvService } from './zatca-tlv.service';
export declare class ZatcaReportingService {
    private prisma;
    private xmlService;
    private cryptoService;
    private tlvService;
    private readonly logger;
    constructor(prisma: PrismaService, xmlService: ZatcaXmlService, cryptoService: ZatcaCryptoService, tlvService: ZatcaTlvService);
    reportOrder(orderId: string): Promise<any>;
}
