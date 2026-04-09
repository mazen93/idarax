import { Tenant, Settings, Branch } from '@prisma/client';
export declare class ZatcaXmlService {
    generateSimplifiedInvoiceXml(order: any, tenant: Tenant, settings: Settings, branch?: Branch): string;
}
