'use client';

import { useState } from 'react';
import { X, User, Phone, MapPin, Table2, CreditCard, ChevronRight, CheckCircle2, ShoppingBag, Hash, Clock, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Props {
    tenant: any;
    branch?: any;
    cart: any[];
    total: number;
    branchId?: string | null;
    tableId?: string | null;
    onClose: () => void;
    onOrderSuccess?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function CheckoutModal({ tenant, branch, cart, total, branchId, tableId, onClose, onOrderSuccess }: Props) {
    const t = useTranslations();
    const { locale } = useParams();
    const isAr = locale === 'ar';

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'details' | 'success'>('details');
    const [form, setForm] = useState({
        customerName: '',
        customerPhone: '',
        deliveryType: tableId ? 'DINE_IN' : 'PICKUP',
        tableNumber: tableId || '',
        source: tableId ? 'QR_CODE' : 'WEB_STORE' as any,
        isPreOrder: false,
        scheduledAt: '' as string
    });

    const [orderId, setOrderId] = useState<string | null>(null);
    const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/public/order/${tenant.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    totalAmount: total,
                    branchId: branchId || undefined,
                    items: cart.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId || undefined,
                        quantity: item.quantity,
                        price: item.price,
                        modifiers: item.modifiers?.map((m: any) => ({
                            optionId: m.optionId
                        }))
                    }))
                })
            });

            if (!res.ok) throw new Error('Failed to place order');
            const data = await res.json();
            const order = data.data || data;
            
            setOrderId(order.id);
            setReceiptNumber(order.receiptNumber);

            // Save to localStorage for history
            try {
                const existing = JSON.parse(localStorage.getItem('idarax_guest_orders') || '[]');
                if (!existing.includes(order.id)) {
                    localStorage.setItem('idarax_guest_orders', JSON.stringify([order.id, ...existing].slice(0, 20)));
                }
            } catch (e) {
                console.error('Failed to save order to history', e);
            }

            setStep('success');
            if (onOrderSuccess) onOrderSuccess();
        } catch (err) {
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
                <div className="relative w-full max-w-lg bg-[#0a0a0b] rounded-[32px] border border-border p-12 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">{t('order_confirmed_msg')}</h2>
                    {receiptNumber && (
                        <div className="bg-primary/20 border border-primary/30 rounded-2xl py-3 px-6 inline-block mb-6">
                            <span className="text-primary font-black text-2xl">#{receiptNumber}</span>
                        </div>
                    )}
                    <p className="text-muted-foreground text-lg mb-8">
                        {t('thank_you_order', { name: form.customerName, tenant: tenant.name })}
                    </p>
                    
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                if (orderId) {
                                    window.open(`${API_URL}/public/order/${orderId}/invoice`, '_blank');
                                }
                            }}
                            className={`w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 border border-border transition-all active:scale-95 ${isAr ? 'flex-row-reverse' : ''}`}
                        >
                            <CreditCard className="w-5 h-5" />
                            {t('download_invoice_pdf')}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary-900/20"
                        >
                            {t('done_action')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0a0a0b] rounded-[40px] border border-border shadow-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                <div className={`p-8 border-b border-border flex items-center justify-between shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <h2 className={`text-2xl font-black text-white flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        {t('checkout_title')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
                        {/* Order Items Summary */}
                        <div className="space-y-4">
                            <h3 className={`text-xs font-bold uppercase tracking-widest text-muted-foreground ${isAr ? 'text-right' : ''}`}>{t('summary')}</h3>
                            <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-border">
                                {cart.map(item => (
                                    <div key={item.uniqueId || item.productId} className={`flex justify-between items-center group ${isAr ? 'flex-row-reverse' : ''}`}>
                                        <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                                            <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-lg text-sm font-black">{item.quantity}x</span>
                                            <span className="font-bold text-white group-hover:text-primary transition-colors">{item.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-300">{tenant.currency} {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-border space-y-2">
                                    <div className={`flex justify-between items-center text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-muted-foreground">{t('subtotal')}</span>
                                        <span className="text-slate-300 font-bold">{tenant?.currency || 'EGP'} {total.toFixed(2)}</span>
                                    </div>
                                    {form.deliveryType === 'DINE_IN' && Number(tenant?.serviceFee) > 0 && (
                                        <div className={`flex justify-between items-center text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-muted-foreground">{t('service_fee')} ({tenant.serviceFee}%)</span>
                                            <span className="text-slate-300 font-bold">{tenant?.currency || 'EGP'} {(total * (Number(tenant.serviceFee) / 100)).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {Number(tenant?.taxRate) > 0 && (
                                        <div className={`flex justify-between items-center text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-muted-foreground">{t('tax')} ({tenant.taxRate}%)</span>
                                            <span className="text-slate-300 font-bold">
                                                {tenant?.currency || 'EGP'} {((total + (form.deliveryType === 'DINE_IN' ? (total * (Number(tenant.serviceFee || 0) / 100)) : 0)) * (Number(tenant.taxRate) / 100)).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex justify-between items-end pt-2 border-t border-border ${isAr ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-muted-foreground font-black uppercase tracking-widest text-xs">{t('total')}</span>
                                        <span className="text-3xl font-black text-white">
                                            {tenant?.currency || 'EGP'} {(
                                                (() => {
                                                    const sub = total;
                                                    const sFee = form.deliveryType === 'DINE_IN' ? (sub * (Number(tenant?.serviceFee || 0) / 100)) : 0;
                                                    const tax = (sub + sFee) * (Number(tenant?.taxRate || 0) / 100);
                                                    return sub + sFee + tax;
                                                })()
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pre-Order Scheduling */}
                        {branch?.preOrderEnabled && !tableId && (
                            <div className="space-y-4">
                                <h3 className={`text-xs font-bold uppercase tracking-widest text-muted-foreground ${isAr ? 'text-right' : ''}`}>{t('order_timing') || 'Order Timing'}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, isPreOrder: false, scheduledAt: '' })}
                                        className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${!form.isPreOrder ? 'bg-primary border-primary-400 text-white' : 'bg-white/5 border-border text-muted-foreground'}`}
                                    >
                                        <Clock className="w-5 h-5" />
                                        <span className="font-bold">{t('order_now') || 'Order Now'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, isPreOrder: true })}
                                        className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all ${form.isPreOrder ? 'bg-primary border-primary-400 text-white' : 'bg-white/5 border-border text-muted-foreground'}`}
                                    >
                                        <Clock className="w-5 h-5" />
                                        <span className="font-bold">{t('schedule_later') || 'Schedule Later'}</span>
                                    </button>
                                </div>

                                {form.isPreOrder && (
                                    <div className="bg-white/5 border border-border rounded-2xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('select_date') || 'Select Date'}</label>
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                                {Array.from({ length: (branch.preOrderMaxDaysAhead || 7) }).map((_, i) => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + i);
                                                    const dateStr = d.toISOString().split('T')[0];
                                                    const isSelected = form.scheduledAt.startsWith(dateStr);
                                                    return (
                                                        <button
                                                            key={dateStr}
                                                            type="button"
                                                            onClick={() => {
                                                                const timePart = form.scheduledAt.includes('T') ? form.scheduledAt.split('T')[1] : '12:00:00';
                                                                setForm({ ...form, scheduledAt: `${dateStr}T${timePart}` });
                                                            }}
                                                            className={`shrink-0 px-4 py-3 rounded-xl border font-bold text-sm transition-all ${isSelected ? 'bg-primary border-primary-400 text-white' : 'bg-white/5 border-border text-muted-foreground hover:border-primary/30'}`}
                                                        >
                                                            {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase">{t('select_time') || 'Select Time'}</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(time => {
                                                    const isSelected = form.scheduledAt.includes(`T${time}`);
                                                    return (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            onClick={() => {
                                                                const datePart = form.scheduledAt.includes('T') ? form.scheduledAt.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                setForm({ ...form, scheduledAt: `${datePart}T${time}:00` });
                                                            }}
                                                            className={`px-3 py-2 rounded-lg border text-sm font-bold transition-all ${isSelected ? 'bg-primary border-primary-400 text-white' : 'bg-white/5 border-border text-muted-foreground hover:border-primary/30'}`}
                                                        >
                                                            {time}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Guest Details */}
                        <div className="space-y-6">
                            <h3 className={`text-xs font-bold uppercase tracking-widest text-muted-foreground ${isAr ? 'text-right' : ''}`}>{t('your_details')}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={`text-sm font-bold text-muted-foreground flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                        <User className="w-4 h-4" /> {t('full_name')}
                                    </label>
                                    <input
                                        required
                                        placeholder={t('full_name')}
                                        value={form.customerName}
                                        onChange={e => setForm({ ...form, customerName: e.target.value })}
                                        dir={isAr ? 'rtl' : 'ltr'}
                                        className="w-full bg-white/5 border border-border rounded-2xl px-5 py-4 text-white outline-none focus:border-primary focus:bg-white/10 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-sm font-bold text-muted-foreground flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                        <Phone className="w-4 h-4" /> {t('phone_number')}
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+1 234..."
                                        value={form.customerPhone}
                                        onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                                        className="w-full bg-white/5 border border-border rounded-2xl px-5 py-4 text-white outline-none focus:border-primary focus:bg-white/10 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            {form.deliveryType === 'DINE_IN' && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                                    <label className={`text-sm font-bold text-muted-foreground flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                        <Hash className="w-4 h-4" /> {t('table_number_optional')}
                                    </label>
                                    <input
                                        placeholder="#"
                                        value={form.tableNumber}
                                        onChange={e => setForm({ ...form, tableNumber: e.target.value })}
                                        className="w-full bg-white/5 border border-border rounded-2xl px-5 py-4 text-white outline-none focus:border-primary focus:bg-white/10 transition-all font-bold"
                                    />
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="p-8 border-t border-border bg-black/40 shrink-0">
                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={loading}
                        className={`w-full py-5 bg-primary hover:bg-primary disabled:opacity-50 text-white rounded-[24px] font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-primary-900/40 group ${isAr ? 'flex-row-reverse' : ''}`}
                    >
                        {loading ? (
                            <div className="flex gap-2">
                                <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-3 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                            </div>
                        ) : (
                            <>
                                {t('place_order_now')}
                                {isAr ? <X className="w-6 h-6 group-hover:-translate-x-1 transition-transform rotate-180" /> : <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                            </>
                        )}
                    </button>
                    <p className="text-center text-muted-foreground text-xs mt-4">By placing this order, you agree to the restaurant&apos;s terms & service.</p>
                </div>
            </div>
        </div>
    );
}
