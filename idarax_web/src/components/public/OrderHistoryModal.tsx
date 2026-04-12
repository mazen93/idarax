'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Receipt, ChevronRight, Package, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Props {
    onClose: () => void;
    tenant: any;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function OrderHistoryModal({ onClose, tenant }: Props) {
    const t = useTranslations();
    const { locale } = useParams();
    const isAr = locale === 'ar';
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const ids = JSON.parse(localStorage.getItem('idarax_guest_orders') || '[]');
            if (ids.length === 0) {
                setOrders([]);
                setLoading(false);
                return;
            }

            // Fetch details for each order
            const fetchedOrders = await Promise.all(
                ids.map(async (id: string) => {
                    try {
                        const res = await fetch(`${API_URL}/public/order/${id}`);
                        if (res.ok) {
                            const json = await res.json();
                            return json.data || json;
                        }
                        return null;
                    } catch (e) {
                        return null;
                    }
                })
            );

            setOrders(fetchedOrders.filter(o => o !== null));
        } catch (err) {
            console.error('Failed to fetch order history', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: t('pending'), color: 'text-warning-500', bg: 'bg-warning-500/10', icon: Clock };
            case 'PREPARING': return { label: t('preparing'), color: 'text-primary-500', bg: 'bg-primary-500/10', icon: Package };
            case 'READY': return { label: t('ready'), color: 'text-primary', bg: 'bg-primary/10', icon: CheckCircle2 };
            case 'COMPLETED': return { label: t('completed'), color: 'text-muted-foreground', bg: 'bg-white/5', icon: CheckCircle2 };
            case 'CANCELLED': 
            case 'VOIDED': return { label: t('cancelled'), color: 'text-error-500', bg: 'bg-error-500/10', icon: AlertCircle };
            default: return { label: status, color: 'text-muted-foreground', bg: 'bg-white/5', icon: Clock };
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-[#0a0a0b] rounded-[40px] border border-border shadow-3xl flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                <div className={`p-8 border-b border-border flex items-center justify-between shrink-0 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <h2 className={`text-2xl font-black text-white flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <Receipt className="w-6 h-6 text-primary" />
                        {t('my_orders')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-muted-foreground font-bold">{t('loading')}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-border">
                            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">{t('no_orders_yet')}</h3>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const { label, color, bg, icon: StatusIcon } = getStatusConfig(order.status);
                                return (
                                    <div key={order.id} className="bg-white/5 border border-border rounded-3xl p-6 hover:border-border transition-all group">
                                        <div className={`flex justify-between items-start mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
                                            <div>
                                                <div className={`flex items-center gap-3 mb-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-2xl font-black text-white">#{order.receiptNumber}</span>
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${bg} ${color} flex items-center gap-1.5`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {label}
                                                    </div>
                                                </div>
                                                <p className={`text-muted-foreground text-xs font-bold ${isAr ? 'text-right' : ''}`}>
                                                    {new Date(order.createdAt).toLocaleDateString(locale as string, { 
                                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                                    })}
                                                </p>
                                            </div>
                                            <div className={isAr ? 'text-left' : 'text-right'}>
                                                <span className="text-xl font-black text-white">{tenant?.currency} {Number(order.totalAmount).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            {order.items?.slice(0, 3).map((item: any) => (
                                                <div key={item.id} className={`flex justify-between text-sm ${isAr ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-muted-foreground font-medium">
                                                        {item.quantity}x {isAr && item.product?.nameAr ? item.product.nameAr : item.product?.name}
                                                    </span>
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <p className={`text-xs text-primary font-bold ${isAr ? 'text-right' : ''}`}>
                                                    + {order.items.length - 3} more items
                                                </p>
                                            )}
                                        </div>

                                        <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                                            <button 
                                                onClick={() => window.open(`${API_URL}/public/order/${order.id}/invoice`, '_blank')}
                                                className={`flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-border transition-all flex items-center justify-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                {t('download_invoice_pdf')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-border bg-black/40 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-primary hover:bg-primary text-white rounded-2xl font-black text-lg transition-all active:scale-95"
                    >
                        {t('done_action')}
                    </button>
                </div>
            </div>
        </div>
    );
}
