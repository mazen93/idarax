"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZatcaXmlService = void 0;
const common_1 = require("@nestjs/common");
const xmlbuilder2_1 = require("xmlbuilder2");
let ZatcaXmlService = class ZatcaXmlService {
    generateSimplifiedInvoiceXml(order, tenant, settings, branch) {
        const issueDate = order.createdAt.toISOString().split('T')[0];
        const issueTime = order.createdAt.toISOString().split('T')[1].split('.')[0];
        const currency = settings.currency || 'SAR';
        const vatNumber = settings.zatcaVatNumber;
        const sellerNameAr = settings.zatcaSellerNameAr || tenant.name;
        const sellerStreet = branch?.address || 'Street';
        const root = (0, xmlbuilder2_1.create)({ version: '1.0', encoding: 'UTF-8' })
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
            .ele('cac:AdditionalDocumentReference')
            .ele('cbc:ID').txt('ICV').up()
            .ele('cbc:UUID').txt('1').up()
            .up()
            .ele('cac:AccountingSupplierParty')
            .ele('cac:Party')
            .ele('cac:PartyIdentification')
            .ele('cbc:ID', { schemeID: 'CRN' }).txt(vatNumber).up()
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
            .ele('cac:LegalMonetaryTotal')
            .ele('cbc:LineExtensionAmount', { currencyID: currency }).txt((Number(order.totalAmount) - Number(order.taxAmount)).toFixed(2)).up()
            .ele('cbc:TaxExclusiveAmount', { currencyID: currency }).txt((Number(order.totalAmount) - Number(order.taxAmount)).toFixed(2)).up()
            .ele('cbc:TaxInclusiveAmount', { currencyID: currency }).txt(Number(order.totalAmount).toFixed(2)).up()
            .ele('cbc:AllowanceTotalAmount', { currencyID: currency }).txt(Number(order.discountAmount || 0).toFixed(2)).up()
            .ele('cbc:PayableAmount', { currencyID: currency }).txt(Number(order.totalAmount).toFixed(2)).up()
            .up();
        order.items.forEach((item, index) => {
            root.ele('cac:InvoiceLine')
                .ele('cbc:ID').txt((index + 1).toString()).up()
                .ele('cbc:InvoicedQuantity', { unitCode: 'PCE' }).txt(item.quantity.toString()).up()
                .ele('cbc:LineExtensionAmount', { currencyID: currency }).txt((Number(item.price) * item.quantity).toFixed(2)).up()
                .ele('cac:TaxTotal')
                .ele('cbc:TaxAmount', { currencyID: currency }).txt((Number(item.price) * item.quantity * 0.15).toFixed(2)).up()
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
};
exports.ZatcaXmlService = ZatcaXmlService;
exports.ZatcaXmlService = ZatcaXmlService = __decorate([
    (0, common_1.Injectable)()
], ZatcaXmlService);
//# sourceMappingURL=zatca-xml.service.js.map