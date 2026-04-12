'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Plus } from 'lucide-react';

interface POSModifierModalProps {
    product: any;
    variant: any;
    t: any;
    isRTL: boolean;
    formatCurrency: (amount: number, currency: string) => string;
    settings: any;
    onClose: () => void;
    onAdd: (product: any, variant: any, selectedOptions: any[]) => void;
}

export function POSModifierModal({
    product,
    variant,
    t,
    isRTL,
    formatCurrency,
    settings,
    onClose,
    onAdd
}: POSModifierModalProps) {
    const [selectedOptions, setSelectedOptions] = useState<any[]>([]);

    const toggleOption = (modifierId: string, option: any, multi: boolean) => {
        if (multi) {
            setSelectedOptions(prev => {
                const existing = prev.find(o => o.id === option.id);
                if (existing) return prev.filter(o => o.id !== option.id);
                return [...prev, option];
            });
        } else {
            setSelectedOptions(prev => {
                const filtered = prev.filter(o => o.modifierId !== modifierId);
                return [...filtered, option];
            });
        }
    };

    const isValid = Array.isArray(product?.modifiers) && product.modifiers.every((m: any) => {
        if (!m.required) return true;
        return Array.isArray(selectedOptions) && selectedOptions.some(o => o.modifierId === m.id);
    });

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm p-4">
            <div className="bg-[var(--background)] border border-border rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-border flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <h3 className="text-2xl font-black text-white">{isRTL ? (product.nameAr || product.name) : product.name}</h3>
                        <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1">{t('customize_item')}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-zinc-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                    {Array.isArray(product?.modifiers) && product.modifiers.map((mod: any) => (
                        <div key={mod.id} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="font-black text-white flex items-center gap-3">
                                    {isRTL ? (mod.nameAr || mod.name) : mod.name}
                                    {mod.required && (
                                        <span className="text-[10px] bg-error-500/10 text-error-500 px-3 py-1 rounded-full uppercase tracking-widest font-black">
                                            {t('required_label')}
                                        </span>
                                    )}
                                </h4>
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                    {mod.multiSelect ? t('select_multiple') : t('select_one')}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {Array.isArray(mod?.options) && mod.options.map((opt: any) => {
                                    const isSelected = selectedOptions.some(o => o.id === opt.id);
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => toggleOption(mod.id, { ...opt, modifierId: mod.id }, mod.multiSelect)}
                                            className={`p-6 rounded-[2rem] border text-left transition-all relative group overflow-hidden ${
                                                isSelected
                                                ? 'bg-primary-500/10 border-primary-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                                                : 'bg-white/[0.02] border-border hover:border-border'
                                            }`}
                                        >
                                            <div className="font-bold text-sm text-white">{isRTL ? (opt.nameAr || opt.name) : opt.name}</div>
                                            {parseFloat(opt.priceAdjust) > 0 && (
                                                <div className="text-sm font-black text-primary mt-2">
                                                    +{formatCurrency(Number(opt.priceAdjust) || 0, settings?.currency)}
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 animate-in zoom-in-0 duration-300">
                                                    <CheckCircle2 className="h-4 w-4 text-primary-500 shadow-xl" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 border-t border-border bg-white/[0.02]">
                    <button
                        onClick={() => onAdd(product, variant, selectedOptions)}
                        disabled={!isValid}
                        className={`w-full h-16 rounded-2xl font-black text-lg uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                            isValid
                            ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-2xl shadow-primary-900/40'
                            : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-border'
                        }`}
                    >
                        <Plus className="h-5 w-5" /> {t('add_to_cart')}
                    </button>
                </div>
            </div>
        </div>
    );
}
