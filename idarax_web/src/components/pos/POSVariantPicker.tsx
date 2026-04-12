'use client';

import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface POSVariantPickerProps {
    product: any;
    t: any;
    isRTL: boolean;
    formatCurrency: (amount: number, currency: string) => string;
    settings: any;
    onClose: () => void;
    onSelect: (product: any, variant: any) => void;
}

export function POSVariantPicker({
    product,
    t,
    isRTL,
    formatCurrency,
    settings,
    onClose,
    onSelect
}: POSVariantPickerProps) {
    if (!product) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div 
                className="bg-[var(--background)] border border-border rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-border flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <h3 className="text-xl font-black text-white">{isRTL ? (product.nameAr || product.name) : product.name}</h3>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">{t('choose_variation')}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-zinc-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {Array.isArray(product.variants) && product.variants.map((variant: any) => (
                        <button
                            key={variant.id}
                            onClick={() => onSelect(product, variant)}
                            className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-border hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-muted-foreground group-hover:text-primary-400 transition-colors">
                                    {(isRTL ? (variant.nameAr || variant.name) : variant.name).charAt(0)}
                                </div>
                                <span className="font-bold text-white text-sm">
                                    {isRTL ? (variant.nameAr || variant.name) : variant.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-primary font-black text-sm">
                                    {formatCurrency(Number(variant.price) || 0, settings?.currency)}
                                </span>
                                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-primary-500 transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
                
                <div className="p-6 bg-white/[0.01] border-t border-border flex items-center justify-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{t('select_to_continue') || 'Select a variant to continue'}</p>
                </div>
            </div>
        </div>
    );
}
