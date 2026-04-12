'use client';

import React from 'react';
import { X, Layers, History, Trash2, Plus, Printer, CheckCircle2 } from 'lucide-react';

interface POSOrdersModalsProps {
    t: any;
    formatCurrency: (amount: number, currency: string) => string;
    settings: any;
    showParked: boolean;
    onCloseParked: () => void;
    parkedOrders: any[];
    onRecallParked: (order: any) => void;
    onFireParked: (orderId: string) => void;
    onVoidParked: (orderId: string) => void;
    
    showRecent: boolean;
    onCloseRecent: () => void;
    recentOrders: any[];
    onRepeatRecent: (orderId: string) => void;
    onPrintRecent: (order: any) => void;
    
    isRTL: boolean;
}

export function POSOrdersModals({
    t,
    formatCurrency,
    settings,
    showParked,
    onCloseParked,
    parkedOrders,
    onRecallParked,
    onFireParked,
    onVoidParked,
    showRecent,
    onCloseRecent,
    recentOrders,
    onRepeatRecent,
    onPrintRecent,
    isRTL
}: POSOrdersModalsProps) {
    if (!showParked && !showRecent) return null;

    const title = showParked ? t('parked_orders') : t('recent_orders');
    const orders = showParked ? parkedOrders : recentOrders;
    const onClose = showParked ? onCloseParked : onCloseRecent;
    const Icon = showParked ? Layers : History;
    const emptyText = showParked ? t('no_parked_orders') : t('no_recent_orders');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="bg-[var(--background)] border border-border rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${showParked ? 'bg-warning-500/10 text-warning-500' : 'bg-primary-500/10 text-primary-500'}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground">{title}</h3>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">
                                {orders.length} {t('entries_found') || 'entries found'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-muted/30 rounded-2xl transition-colors text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-hide space-y-4">
                    {orders.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-6">
                            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center border border-border/50">
                                <Icon className="w-10 h-10 opacity-30" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black uppercase tracking-[0.2em]">{emptyText}</p>
                                <p className="text-[10px] text-muted-foreground mt-2 max-w-[200px] mx-auto italic">
                                    {showParked 
                                        ? "No orders are currently held on tables or parked." 
                                        : "No recent transactions found for this shift."}
                                </p>
                            </div>
                            {showParked && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseParked();
                                        // Small delay to allow the first modal to close
                                        setTimeout(() => {
                                            const event = new CustomEvent('showRecentOrders');
                                            window.dispatchEvent(event);
                                        }, 100);
                                    }}
                                    className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20 flex items-center gap-2"
                                >
                                    <History className="w-3.5 h-3.5" /> {t('view_recent_orders') || 'View Recent Orders'}
                                </button>
                            )}
                        </div>
                    ) : (
                        orders.map((order: any) => (
                            <div key={order.id} className="p-6 rounded-[2rem] bg-muted/10 border border-border hover:border-border transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">#{order.id.slice(-8).toUpperCase()}</p>
                                        <p className="text-lg font-bold text-foreground">{order.customer?.name || t('walk_in')}</p>
                                        <div className="flex items-center gap-2">
                                           <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                               order.status === 'COMPLETED' ? 'bg-primary/10 text-primary border-primary/20' : 
                                               order.status === 'HELD' ? 'bg-warning-500/10 text-warning-500 border-warning-500/20' : 
                                               'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                           }`}>
                                               {t(order.status.toLowerCase())}
                                           </span>
                                           {(!order.paidAmount || Number(order.paidAmount) < Number(order.totalAmount)) && (
                                               <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-error-500/10 text-error-500 border border-error-500/20 flex items-center gap-1">
                                                   <div className="w-1.5 h-1.5 rounded-full bg-error-500 animate-pulse" />
                                                   {t('unpaid') || 'UNPAID'}
                                               </span>
                                           )}
                                           <span className="text-[10px] text-muted-foreground font-bold">{new Date(order.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-foreground tracking-tighter">{formatCurrency(Number(order.totalAmount) || 0, settings?.currency)}</p>
                                        <p className="text-[10px] font-black text-primary/50 uppercase tracking-widest mt-1">
                                            {order.items?.length} {t('items')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {showParked ? (
                                        <>
                                            <button
                                                onClick={() => onRecallParked(order)}
                                                className="flex-1 h-12 bg-primary hover:bg-primary text-primary-foreground text-xs font-black rounded-xl transition-all shadow-lg shadow-success-900/10 uppercase tracking-widest"
                                            >
                                                {t('pay') || 'PAY'}
                                            </button>
                                            <button
                                                onClick={() => onFireParked(order.id)}
                                                className="flex-1 h-12 bg-muted/20 hover:bg-muted/30 text-foreground text-xs font-black rounded-xl transition-all border border-border uppercase tracking-widest"
                                            >
                                                {t('fire')}
                                            </button>
                                            <button
                                                onClick={() => onVoidParked(order.id)}
                                                className="w-12 h-12 bg-error-500/10 hover:bg-error-500/20 text-error-500 rounded-xl transition-all border border-error-500/20 flex items-center justify-center shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onRepeatRecent(order.id)}
                                                className="flex-1 h-12 bg-primary text-primary-foreground text-xs font-black rounded-xl transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                                            >
                                                <Plus className="w-4 h-4" /> {t('repeat_order')}
                                            </button>
                                            <button
                                                onClick={() => onPrintRecent(order)}
                                                className="w-12 h-12 bg-muted/20 hover:bg-muted/30 text-muted-foreground rounded-xl border border-border transition-all flex items-center justify-center shrink-0"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
