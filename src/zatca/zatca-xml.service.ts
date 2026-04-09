import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import { Order, Tenant, Settings, OrderItem, Branch } from '@prisma/client';

@Injectable()
export class ZatcaXmlService {
  /**
   * Generates a Simplified Tax Invoice UBL 2.1 XML for ZATCA
   * @param order Full order object with items
   * @param tenant Tenant object
   * @param settings Tenant settings (VAT number, seller names)
   */
  generateSimplifiedInvoiceXml(
    order: any, 
    tenant: Tenant, 
    settings: Settings,
    branch?: Branch
  ): string {
    const issueDate = order.createdAt.toISOString().split('T')[0];
    const issueTime = order.createdAt.toISOString().split('T')[1].split('.')[0];
    const currency = settings.currency || 'SAR';
    const vatNumber = (settings as any).zatcaVatNumber;
    const sellerNameAr = (settings as any).zatcaSellerNameAr || tenant.name;
    const sellerStreet = branch?.address || 'Street';

    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Invoice', {
        'xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2'
      })
        .ele('ext:UBLExtensions').up()
        .ele('cbc:UBLVersionID').txt('2.1').up()
        .ele('cbc:ProfileID').txt('reporting:1.0').up()
        .ele('cbc:ID').txt(order.invoiceNumber || order.id).up()
        .ele('cbc:UUID').txt(order.id).up()
        .ele('cbc:IssueDate').txt(issueDate).up()
        .ele('cbc:IssueTime').txt(issueTime).up()
        .ele('cbc:InvoiceTypeCode', { name: '0211010' }).txt('388').up()
        .ele('cbc:DocumentCurrencyCode').txt(currency).up()
        .ele('cbc:TaxCurrencyCode').txt(currency).up()
        
        // Settings for Simplified Tax Invoice
        .ele('cac:AdditionalDocumentReference')
          .ele('cbc:ID').txt('ICV').up()
          .ele('cbc:UUID').txt('1').up() // Invoice Counter Value - should be tracked per EGS
        .up()
        
        .ele('cac:AccountingSupplierParty')
          .ele('cac:Party')
            .ele('cac:PartyIdentification')
              .ele('cbc:ID', { schemeID: 'CRN' }).txt(vatNumber).up() // Should be CRN or similar
            .up()
            .ele('cac:PostalAddress')
              .ele('cbc:StreetName').txt(sellerStreet).up()
              .ele('cbc:BuildingNumber').txt('1').up()
              .ele('cbc:CityName').txt(branch?.address?.split(',')[0] || 'Riyadh').up()
              .ele('cbc:PostalZone').txt('12345').up()
              .ele('cbc:CountrySubentity').txt('Riyadh').up()
              .ele('cac:Country')
                .ele('cbc:IdentificationCode').txt('SA').up()
              .up()
            .up()
            .ele('cac:PartyTaxScheme')
              .ele('cbc:RegistrationName').txt(sellerNameAr).up()
              .ele('cbc:CompanyID').txt(vatNumber).up()
              .ele('cac:TaxScheme')
                .ele('cbc:ID').txt('VAT').up()
              .up()
            .up()
            .ele('cac:PartyLegalEntity')
              .ele('cbc:RegistrationName').txt(sellerNameAr).up()
            .up()
          .up()
        .up()

        .ele('cac:AccountingCustomerParty')
           .ele('cac:Party')
             .ele('cac:PostalAddress')
               .ele('cac:Country')
                 .ele('cbc:IdentificationCode').txt('SA').up()
               .up()
             .up()
           .up()
        .up()

        // Tax Totals
        .ele('cac:TaxTotal')
          .ele('cbc:TaxAmount', { currencyID: currency }).txt(Number(order.taxAmount).toFixed(2)).up()
          .ele('cac:TaxSubtotal')
            .ele('cbc:TaxableAmount', { currencyID: currency }).txt((Number(order.totalAmount) - Number(order.taxAmount)).toFixed(2)).up()
            .ele('cbc:TaxAmount', { currencyID: currency }).txt(Number(order.taxAmount).toFixed(2)).up()
            .ele('cac:TaxCategory')
              .ele('cbc:ID').txt('S').up()
              .ele('cbc:Percent').txt('15.00').up()
              .ele('cac:TaxScheme')
                .ele('cbc:ID').txt('VAT').up()
              .up()
            .up()
          .up()
        .up()

        // Monetary Totals
        .ele('cac:LegalMonetaryTotal')
          .ele('cbc:LineExtensionAmount', { currencyID: currency }).txt((Number(order.totalAmount) - Number(order.taxAmount)).toFixed(2)).up()
          .ele('cbc:TaxExclusiveAmount', { currencyID: currency }).txt((Number(order.totalAmount) - Number(order.taxAmount)).toFixed(2)).up()
          .ele('cbc:TaxInclusiveAmount', { currencyID: currency }).txt(Number(order.totalAmount).toFixed(2)).up()
          .ele('cbc:AllowanceTotalAmount', { currencyID: currency }).txt(Number(order.discountAmount || 0).toFixed(2)).up()
          .ele('cbc:PayableAmount', { currencyID: currency }).txt(Number(order.totalAmount).toFixed(2)).up()
        .up();

    // Invoice Lines
    order.items.forEach((item: any, index: number) => {
      root.ele('cac:InvoiceLine')
        .ele('cbc:ID').txt((index + 1).toString()).up()
        .ele('cbc:InvoicedQuantity', { unitCode: 'PCE' }).txt(item.quantity.toString()).up()
        .ele('cbc:LineExtensionAmount', { currencyID: currency }).txt((Number(item.price) * item.quantity).toFixed(2)).up()
        .ele('cac:TaxTotal')
          .ele('cbc:TaxAmount', { currencyID: currency }).txt((Number(item.price) * item.quantity * 0.15).toFixed(2)).up() // Assuming 15% VAT
          .ele('cac:TaxSubtotal')
            .ele('cbc:TaxableAmount', { currencyID: currency }).txt((Number(item.price) * item.quantity).toFixed(2)).up()
            .ele('cbc:TaxAmount', { currencyID: currency }).txt((Number(item.price) * item.quantity * 0.15).toFixed(2)).up()
            .ele('cac:TaxCategory')
              .ele('cbc:ID').txt('S').up()
              .ele('cbc:Percent').txt('15.00').up()
              .ele('cac:TaxScheme')
                .ele('cbc:ID').txt('VAT').up()
              .up()
            .up()
          .up()
        .up()
        .ele('cac:Item')
          .ele('cbc:Name').txt(item.product.name).up()
          .ele('cac:ClassifiedTaxCategory')
            .ele('cbc:ID').txt('S').up()
            .ele('cbc:Percent').txt('15.00').up()
            .ele('cac:TaxScheme')
              .ele('cbc:ID').txt('VAT').up()
            .up()
          .up()
        .up()
        .ele('cac:Price')
          .ele('cbc:PriceAmount', { currencyID: currency }).txt(Number(item.price).toFixed(2)).up()
        .up()
      .up();
    });

    return root.end({ prettyPrint: true });
  }
}
