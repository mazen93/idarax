'use client';

import React from 'react';
import { CheckCircle2, WifiOff, Printer, Mail, X, Plus, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface POSSuccessModalProps {
    isOpen: boolean;
    isOffline: boolean;
    orderId: string | null;
    orderData: any;
    t: any;
    onClose: () => void;
    onPrint: () => void;
    onSendEmail: (email: string) => void;
    customerEmail?: string;
    isSendingEmail?: boolean;
}

export function POSSuccessModal({
    isOpen,
    isOffline,
    orderId,
    orderData,
    t,
    onClose,
    onPrint,
    onSendEmail,
    customerEmail = '',
    isSendingEmail = false
}: POSSuccessModalProps) {
    const [showEmailInput, setShowEmailInput] = React.useState(false);
    const [email, setEmail] = React.useState(customerEmail);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-[var(--background)] border border-border rounded-[3.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(139,92,246,0.1)] p-12 text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
                
                {/* Visual Background Elements */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-center">
                        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center border-2 transition-all duration-700 scale-110 ${
                            isOffline
                            ? 'bg-warning-500/10 border-warning-500/30'
                            : 'bg-primary/10 border-primary/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                        }`}>
                            {isOffline
                                ? <WifiOff className="h-10 w-10 text-warning-500 animate-pulse" />
                                : <CheckCircle2 className="h-10 w-10 text-primary" />}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-foreground tracking-tight">
                            {isOffline ? t('order_saved_offline') || 'Saved Offline' : t('order_placed')}
                        </h2>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                            {isOffline 
                                ? t('offline_sync_msg') || 'Will sync when connection is restored' 
                                : t('order_sent_to_kitchen')}
                        </p>
                        <div className="inline-block px-4 py-2 bg-muted/30 rounded-2xl border border-border mt-4">
                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-tighter mr-2">Order ID</span>
                            <span className="text-foreground font-mono text-sm font-bold">#{orderId?.slice(-8).toUpperCase() || 'LOCAL'}</span>
                        </div>
                    </div>

                    {/* ZATCA QR Code Display */}
                    {!isOffline && orderData?.zatcaReport?.qrCode && (
                        <div className="flex flex-col items-center gap-4 bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 animate-in slide-in-from-bottom-4 duration-700">
                             <div className="bg-white p-4 rounded-3xl shadow-xl">
                                <QRCodeSVG 
                                    value={orderData.zatcaReport.qrCode} 
                                    size={140}
                                    level="M"
                                    includeMargin={false}
                                />
                             </div>
                             <div className="flex items-center gap-2 text-primary">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Fiscal Signature Verified (ZATCA)</span>
                             </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-6">
                        <button
                            onClick={onPrint}
                            className="h-16 bg-muted/30 hover:bg-muted/50 text-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-border flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Printer className="w-5 h-5 text-muted-foreground" />
                            {t('print_receipt')}
                        </button>
                        <button
                            onClick={() => setShowEmailInput(!showEmailInput)}
                            className={`h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border flex items-center justify-center gap-3 active:scale-95 ${
                                showEmailInput 
                                ? 'bg-primary/20 border-primary/50 text-primary' 
                                : 'bg-muted/30 border-border text-foreground hover:bg-muted/50'
                            }`}
                        >
                            <Mail className="w-5 h-5" />
                            {t('email_receipt')}
                        </button>
                    </div>

                    {showEmailInput && (
                        <div className="flex gap-2 animate-in slide-in-from-top-4 duration-500">
                            <input
                                type="email"
                                placeholder={t('enter_email') || 'customer@example.com'}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="flex-1 h-14 bg-muted border border-border rounded-2xl px-6 text-foreground text-sm font-bold placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
                                autoFocus
                            />
                            <button
                                onClick={() => onSendEmail(email)}
                                disabled={isSendingEmail || !email}
                                className="px-8 h-14 bg-primary hover:bg-primary disabled:opacity-50 text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                            >
                                {isSendingEmail ? '...' : t('send')}
                            </button>
                        </div>
                    )}

                    <div className="pt-8">
                        <button 
                            onClick={onClose} 
                            className="w-full h-20 bg-primary hover:bg-primary text-primary-foreground rounded-[2rem] font-black text-lg uppercase tracking-[0.3em] transition-all shadow-2xl shadow-success-900/40 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Plus className="w-6 h-6" />
                            {t('new_order')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
