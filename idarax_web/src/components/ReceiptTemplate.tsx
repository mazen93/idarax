'use client';

import React from 'react';

interface ReceiptProps {
    tenant: any;
    order: any;
    settings: {
        currency: string;
        taxRate: number;
        serviceFee: number;
        receiptHeader?: string;
        receiptFooter?: string;
        logoUrl?: string;
        receiptShowLogo?: boolean;
        receiptShowTable?: boolean;
        receiptShowCustomer?: boolean;
        receiptShowOrderNumber?: boolean;
        receiptFontSize?: number;
        receiptQrCodeUrl?: string;
        receiptLanguage?: string;
        receiptShowTimestamp?: boolean;
        receiptShowOrderType?: boolean;
        receiptShowOperator?: boolean;
        receiptShowItemsDescription?: boolean;
        receiptShowItemsQty?: boolean;
        receiptShowItemsPrice?: boolean;
        receiptShowSubtotal?: boolean;
        receiptShowTax?: boolean;
        receiptShowServiceCharge?: boolean;
        receiptShowDiscount?: boolean;
        receiptShowTotal?: boolean;
        receiptShowPaymentMethod?: boolean;
        receiptShowBarcode?: boolean;
    };
}

const DICTIONARY: Record<string, { en: string; ar: string }> = {
    receipt_no: { en: 'RECEIPT NO', ar: 'رقم الإيصال' },
    invoice_no: { en: 'INVOICE NO', ar: 'رقم الفاتورة' },
    order_ref: { en: 'ORDER REFERENCE', ar: 'مرجع الطلب' },
    timestamp: { en: 'TIMESTAMP', ar: 'الوقت والتاريخ' },
    order_type: { en: 'ORDER TYPE', ar: 'نوع الطلب' },
    table: { en: 'STATION / TABLE', ar: 'الطاولة / المحطة' },
    operator: { en: 'OPERATOR / GUEST', ar: 'المشغل / الضيف' },
    delivery_addr: { en: 'Delivery Address', ar: 'عنوان التوصيل' },
    description: { en: 'DESCRIPTION', ar: 'الوصف' },
    qty: { en: 'QTY', ar: 'الكمية' },
    total: { en: 'TOTAL', ar: 'المجموع' },
    subtotal: { en: 'SUBTOTAL', ar: 'المجموع الفرعي' },
    discount: { en: 'DISCOUNT', ar: 'الخصم' },
    tax: { en: 'GOVT TAX', ar: 'الضريبة الحكومية' },
    service_charge: { en: 'SERVICE CHARGE', ar: 'رسوم الخدمة' },
    grand_total: { en: 'TOTAL', ar: 'الإجمالي' },
    payment: { en: 'Payment', ar: 'طريقة الدفع' },
    balance: { en: 'Balance Due', ar: 'المبلغ المتبقي' },
    scan_more: { en: 'Scan for more info', ar: 'امسح للمزيد من المعلومات' },
    pos_trans: { en: 'POS TRANS', ar: 'عملية نقاط البيع' },
    system_by: { en: 'SYSTEM BY IDARAX SOLUTIONS', ar: 'نظام إداركس للحلول التقنية' }
};

export default function ReceiptTemplate({ tenant, order, settings }: ReceiptProps) {
    const lang = (settings.receiptLanguage === 'ar' ? 'ar' : 'en') as 'en' | 'ar';
    const isAr = lang === 'ar';
    const t = (key: string) => DICTIONARY[key]?.[lang] || key;

    const tenantName = tenant?.name || localStorage.getItem('tenant_name') || 'IDARAX STORE';
    const subtotal = order.items?.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0) || 0;
    const tax = Number(order.taxAmount) || 0;
    const serviceFee = Number(order.serviceFeeAmount) || 0;
    const total = Number(order.totalAmount);

    const fontSize = settings.receiptFontSize || 12;

    return (
        <div
            id="thermal-receipt"
            className={`receipt-container text-[#1a1a1a] bg-white p-6 font-mono leading-relaxed max-w-[80mm] mx-auto shadow-2xl ${isAr ? 'text-right' : 'text-left'}`}
            style={{ fontSize: `${fontSize}px`, direction: isAr ? 'rtl' : 'ltr' }}
        >
            {/* Header */}
            <div className="text-center mb-8">
                {settings.receiptShowLogo !== false && settings.logoUrl && (
                    <img src={settings.logoUrl} alt="Logo" className="w-20 h-20 object-contain mx-auto mb-4 grayscale contrast-125 shadow-sm rounded-lg" />
                )}
                <h1 className="text-2xl font-black uppercase tracking-tight mb-1">{tenantName}</h1>
                {settings.receiptHeader && (
                    <div className="text-[10px] text-slate-600 whitespace-pre-wrap leading-tight mt-2 border-b border-dashed border-black/10 pb-4 mb-4 uppercase font-bold tracking-widest">
                        {settings.receiptHeader}
                    </div>
                )}
            </div>

            {/* Order Info */}
            <div className={`space-y-1.5 mb-6 border-b border-dashed border-black/10 pb-6`} style={{ fontSize: `${Math.max(8, fontSize - 2)}px` }}>
                {settings.receiptShowOrderNumber !== false && (
                    <>
                        <div className="flex justify-between uppercase">
                            <span>{t('receipt_no')}</span>
                            <span className="font-bold text-lg leading-none">
                                {order.receiptNumber ? `#${order.receiptNumber.toString().padStart(3, '0')}` : `#${order.id?.substring(0, 8).toUpperCase()}`}
                            </span>
                        </div>
                        {order.invoiceNumber && (
                            <div className="flex justify-between uppercase">
                                <span>{t('invoice_no')}</span>
                                <span className="font-bold text-[10px] break-all max-w-[130px] text-right">
                                    {order.invoiceNumber}
                                </span>
                            </div>
                        )}
                        {!order.receiptNumber && (
                            <div className="flex justify-between uppercase">
                                <span>{t('order_ref')}</span>
                                <span className="font-bold">#{order.id?.substring(0, 8).toUpperCase()}</span>
                            </div>
                        )}
                    </>
                )}

                {settings.receiptShowTimestamp !== false && (
                    <div className="flex justify-between uppercase">
                        <span>{t('timestamp')}</span>
                        <span>{new Date(order.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-GB', { hour12: true })}</span>
                    </div>
                )}

                {settings.receiptShowOrderType !== false && (
                    <div className="flex justify-between uppercase">
                        <span>{t('order_type')}</span>
                        <span className="font-bold">{order.orderType || 'IN STORE'}</span>
                    </div>
                )}

                {settings.receiptShowTable !== false && order.table && (
                    <div className="flex justify-between uppercase">
                        <span>{t('table')}</span>
                        <span className="font-bold">#{order.table.number}</span>
                    </div>
                )}

                {settings.receiptShowOperator !== false && (
                    <div className="flex justify-between uppercase">
                        <span>{t('operator')}</span>
                        <span className="truncate ml-4 max-w-[120px] font-bold">{order.customer?.name || order.guestName || 'GUEST'}</span>
                    </div>
                )}

                {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                    <div className="mt-4 p-3 bg-black/5 rounded-xl border-2 border-black/10">
                        <p className="text-[8px] font-black uppercase opacity-40 mb-1">{t('delivery_addr')}</p>
                        <p className="text-xs font-bold leading-snug uppercase">{order.deliveryAddress}</p>
                    </div>
                )}
            </div>

            {/* Items */}
            <div className="mb-6">
                <div className="flex justify-between font-black mb-3 border-b-2 border-black pb-1.5 uppercase" style={{ fontSize: `${fontSize}px` }}>
                    {settings.receiptShowItemsDescription !== false && <span className="flex-1">{t('description')}</span>}
                    {settings.receiptShowItemsQty !== false && <span className="w-10 text-center">{t('qty')}</span>}
                    {settings.receiptShowItemsPrice !== false && <span className="w-20 text-right">{t('total')}</span>}
                </div>
                <div className="space-y-4">
                    {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1 border-b border-dashed border-black/5 pb-2">
                            <div className="flex justify-between items-start" style={{ fontSize: `${fontSize}px` }}>
                                {settings.receiptShowItemsDescription !== false && (
                                    <div className="flex-1 pr-3">
                                        <p className="font-bold uppercase tracking-tight">
                                            {item.product?.name || item.name || 'Item Name'}
                                            {item.isReward && <span className="ml-2 text-[0.7em] bg-black text-white px-1.5 py-0.5 rounded font-black tracking-widest">{isAr ? 'مكافأة' : 'REWARD'}</span>}
                                        </p>
                                        {(item.variantName || item.variant?.name) && <p className="text-[0.8em] text-muted-foreground uppercase font-medium mt-0.5">↳ {item.variantName || item.variant?.name}</p>}
                                    </div>
                                )}
                                {settings.receiptShowItemsQty !== false && <span className="w-10 text-center font-medium">x{item.quantity}</span>}
                                {settings.receiptShowItemsPrice !== false && <span className="w-20 text-right font-bold">{(Number(item.price) * item.quantity).toFixed(2)}</span>}
                            </div>
                            {item.note && (
                                <div className="text-[0.75em] text-slate-600 italic pl-2 border-l border-black/20">
                                    {isAr ? 'ملاحظة' : 'Note'}: {item.note}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-black pt-4 space-y-2" style={{ fontSize: `${fontSize}px` }}>
                {settings.receiptShowSubtotal !== false && (
                    <div className="flex justify-between text-slate-600 font-medium">
                        <span>{t('subtotal')}</span>
                        <span>{settings.currency} {subtotal.toFixed(2)}</span>
                    </div>
                )}

                {settings.receiptShowDiscount !== false && Number(order.discountAmount) > 0 && (
                    <div className="flex-col gap-1">
                        {Number(order.loyaltyCashback) > 0 && (
                            <div className="flex justify-between text-slate-600 font-medium tracking-tight">
                                <span>{isAr ? 'مكافأة الولاء' : 'Loyalty Reward'}</span>
                                <span>-{settings.currency} {Number(order.loyaltyCashback).toFixed(2)}</span>
                            </div>
                        )}
                        {Number(order.discountAmount) - Number(order.loyaltyCashback) > 0 && (
                            <div className="flex justify-between text-slate-600 font-medium tracking-tight">
                                <span>{t('discount')} {order.offerCode ? `(${order.offerCode})` : ''}</span>
                                <span>-{settings.currency} {(Number(order.discountAmount) - Number(order.loyaltyCashback)).toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                )}

                {settings.receiptShowTax !== false && tax > 0 && (
                    <div className="flex justify-between text-slate-600 font-medium tracking-tight">
                        <span>{t('tax')} ({settings.taxRate}%)</span>
                        <span>{settings.currency} {tax.toFixed(2)}</span>
                    </div>
                )}

                {settings.receiptShowServiceCharge !== false && serviceFee > 0 && (
                    <div className="flex justify-between text-slate-600 font-medium">
                        <span>{t('service_charge')}</span>
                        <span>{settings.currency} {serviceFee.toFixed(2)}</span>
                    </div>
                )}

                {settings.receiptShowTotal !== false && (
                    <div className="flex justify-between font-black pt-3 mt-4 border-t-4 border-double border-black leading-none" style={{ fontSize: `${fontSize + 4}px` }}>
                        <span>{t('grand_total')}</span>
                        <span>{settings.currency} {total.toFixed(2)}</span>
                    </div>
                )}
            </div>

            {/* Order Note */}
            {order.note && (
                <div className="mt-4 p-2 bg-black/5 rounded text-center" style={{ fontSize: `${Math.max(8, fontSize - 2)}px` }}>
                    <p className="font-bold uppercase text-[0.8em] opacity-40">{isAr ? 'ملاحظات الطلب' : 'Order Instructions'}</p>
                    <p className="italic">{order.note}</p>
                </div>
            )}

            {/* Payment Details */}
            {settings.receiptShowPaymentMethod !== false && (
                <div className="mt-4 pt-4 border-t border-dashed border-black/10 italic text-muted-foreground flex justify-between uppercase" style={{ fontSize: `${Math.max(7, fontSize - 4)}px` }}>
                    <span>{t('payment')}: {order.paymentMethod || 'CASH'}</span>
                    <span>{t('balance')}: 0.00</span>
                </div>
            )}

            {/* Footer */}
            <div className="text-center mt-12 space-y-6">
                {settings.receiptFooter && (
                    <div className="text-slate-600 whitespace-pre-wrap leading-relaxed italic border-y border-dashed border-black/10 py-4 uppercase tracking-wider" style={{ fontSize: `${Math.max(8, fontSize - 2)}px` }}>
                        {settings.receiptFooter}
                    </div>
                )}

                {settings.receiptQrCodeUrl && (
                    <div className="flex flex-col items-center gap-2 pt-4">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(settings.receiptQrCodeUrl)}`}
                            alt="QR Code"
                            className="w-24 h-24 grayscale"
                        />
                        <p className="text-[8px] uppercase font-bold text-muted-foreground">{t('scan_more')}</p>
                    </div>
                )}

                {settings.receiptShowBarcode !== false && (
                    <div className="pt-4 flex flex-col items-center">
                        {/* Professional Procedural Barcode */}
                        <div className="flex gap-px h-8 w-full justify-center bg-black/5 p-1 rounded-sm">
                            {[...Array(60)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-full ${Math.random() > 0.5 ? 'w-[2px] bg-black' : (Math.random() > 0.3 ? 'w-[1px] bg-black' : 'w-px bg-transparent')}`}
                                />
                            ))}
                        </div>
                        <p className="text-[8px] mt-2 font-black text-black tracking-[0.3em] uppercase opacity-30">{t('pos_trans')} PK-ID-{order.id?.slice(-6).toUpperCase()}</p>
                        <p className="text-[7px] mt-4 text-muted-foreground font-bold uppercase tracking-widest">{t('system_by')}</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        @media print {
          body * { visibility: hidden; }
          .receipt-container, .receipt-container * { visibility: visible; }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
            box-shadow: none;
            direction: ${isAr ? 'rtl' : 'ltr'};
          }
        }
      `}</style>
        </div>
    );
}
