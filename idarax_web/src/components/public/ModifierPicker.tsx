'use client';

import { useState, useMemo } from 'react';
import { X, Plus, Minus, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface ModifierOption {
    id: string;
    name: string;
    nameAr?: string;
    priceAdjust: number;
}

interface Modifier {
    id: string;
    name: string;
    nameAr?: string;
    required: boolean;
    multiSelect: boolean;
    options: ModifierOption[];
}

interface Variant {
    id: string;
    name: string;
    nameAr?: string;
    price: number | null;
}

interface Product {
    id: string;
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    price: number;
    variants?: Variant[];
    modifiers?: Modifier[];
}

interface Props {
    product: Product;
    currency: string;
    onClose: () => void;
    onAdd: (item: any) => void;
}

export default function ModifierPicker({ product, currency, onClose, onAdd }: Props) {
    const t = useTranslations();
    const { locale } = useParams();
    const isAr = locale === 'ar';

    const [selectedVariant, setSelectedVariant] = useState<string | null>(
        product.variants && product.variants.length > 0 ? product.variants[0].id : null
    );
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
    const [quantity, setQuantity] = useState(1);

    const currentBasePrice = useMemo(() => {
        if (selectedVariant) {
            const variant = product.variants?.find(v => v.id === selectedVariant);
            if (variant && variant.price !== null) return Number(variant.price);
        }
        return Number(product.price);
    }, [product, selectedVariant]);

    const modifiersPrice = useMemo(() => {
        let total = 0;
        Object.values(selectedOptions).flat().forEach(optionId => {
            const option = product.modifiers
                ?.flatMap(m => m.options)
                .find(o => o.id === optionId);
            if (option) total += Number(option.priceAdjust);
        });
        return total;
    }, [product, selectedOptions]);

    const totalPrice = (currentBasePrice + modifiersPrice) * quantity;

    const toggleOption = (modifierId: string, optionId: string, multiSelect: boolean) => {
        setSelectedOptions(prev => {
            const current = prev[modifierId] || [];
            if (multiSelect) {
                if (current.includes(optionId)) {
                    return { ...prev, [modifierId]: current.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [modifierId]: [...current, optionId] };
                }
            } else {
                return { ...prev, [modifierId]: [optionId] };
            }
        });
    };

    const handleAdd = () => {
        // Validation for required modifiers
        const missingRequired = product.modifiers?.filter(m => m.required && (!selectedOptions[m.id] || selectedOptions[m.id].length === 0));
        if (missingRequired && missingRequired.length > 0) {
            alert(`Please select: ${missingRequired.map(m => isAr && m.nameAr ? m.nameAr : m.name).join(', ')}`);
            return;
        }

        const cartItem = {
            productId: product.id,
            name: isAr && product.nameAr ? product.nameAr : product.name,
            variantId: selectedVariant,
            variantName: product.variants?.find(v => v.id === selectedVariant)?.name,
            quantity,
            price: currentBasePrice + modifiersPrice,
            modifiers: Object.entries(selectedOptions).flatMap(([modId, optIds]) => {
                const modifier = product.modifiers?.find(m => m.id === modId);
                return optIds.map(optId => {
                    const option = modifier?.options.find(o => o.id === optId);
                    return {
                        optionId: optId,
                        name: isAr && option?.nameAr ? option.nameAr : option?.name,
                        priceAdjust: option?.priceAdjust || 0
                    };
                });
            })
        };

        onAdd(cartItem);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative w-full max-w-xl bg-[#0a0a0b] sm:rounded-[32px] rounded-t-[32px] border border-border flex flex-col max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">
                {/* Header */}
                <div className={`p-6 border-b border-border flex items-center justify-between sticky top-0 bg-[#0a0a0b] z-10 ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className={isAr ? 'text-right' : ''}>
                        <h2 className="text-xl font-black text-white">{isAr && product.nameAr ? product.nameAr : product.name}</h2>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                            {isAr && product.descriptionAr ? product.descriptionAr : (product.description || t('customize_order'))}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-full text-muted-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="space-y-4">
                            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                <div className="w-1 h-1 bg-primary rounded-full" />
                                {t('choose_variation')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v.id)}
                                        className={`flex flex-col p-4 rounded-2xl border transition-all ${isAr ? 'text-right' : 'text-left'} group ${selectedVariant === v.id ? 'bg-primary border-primary-400 text-white shadow-lg shadow-primary-900/30' : 'bg-white/5 border-border text-muted-foreground hover:border-border hover:bg-white/10'}`}
                                    >
                                        <span className="font-bold text-sm mb-1">{isAr && v.nameAr ? v.nameAr : v.name}</span>
                                        <span className={`text-xs font-black ${selectedVariant === v.id ? 'text-primary-200' : 'text-muted-foreground'}`}>
                                            {currency} {v.price !== null ? Number(v.price).toFixed(2) : Number(product.price).toFixed(2)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Modifiers */}
                    {product.modifiers?.map((modifier) => (
                        <div key={modifier.id} className="space-y-4">
                            <div className={`flex justify-between items-end ${isAr ? 'flex-row-reverse' : ''}`}>
                                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-1 h-1 bg-primary rounded-full" />
                                    {isAr && modifier.nameAr ? modifier.nameAr : modifier.name}
                                </h3>
                                {modifier.required && (
                                    <span className="px-2 py-0.5 bg-error-500/10 text-error-500 text-[9px] font-black rounded-full border border-error-500/20 uppercase tracking-tighter">{t('required_label')}</span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {modifier.options.map((option) => {
                                    const isSelected = selectedOptions[modifier.id]?.includes(option.id);
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => toggleOption(modifier.id, option.id, modifier.multiSelect)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${isAr ? 'flex-row-reverse' : ''} ${isSelected ? 'bg-primary/10 border-primary/50 text-white' : 'bg-white/5 border-border text-muted-foreground hover:border-border hover:bg-white/10'}`}
                                        >
                                            <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-border p-1 group-hover:border-white/20'}`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                                </div>
                                                <span className="font-bold text-sm">{isAr && option.nameAr ? option.nameAr : option.name}</span>
                                            </div>
                                            {option.priceAdjust > 0 && (
                                                <span className={`text-xs font-black px-2 py-1 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground'}`}>
                                                    +{currency} {Number(option.priceAdjust).toFixed(2)}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-black/40 space-y-4 sticky bottom-0 z-10 backdrop-blur-md">
                    <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center bg-white/5 rounded-2xl p-1 gap-2 border border-border ${isAr ? 'flex-row-reverse' : ''}`}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><Minus className="w-5 h-5"/></button>
                            <span className="w-10 text-center font-black text-xl">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><Plus className="w-5 h-5"/></button>
                        </div>
                        <div className={isAr ? 'text-left' : 'text-right'}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{t('total_price')}</p>
                            <span className="text-3xl font-black text-white">{currency} {totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className={`w-full flex items-center justify-center gap-3 py-5 bg-primary hover:bg-primary text-white rounded-[24px] font-black text-lg transition-all shadow-xl shadow-primary-900/40 group active:scale-[0.98] ${isAr ? 'flex-row-reverse' : ''}`}
                    >
                        {t('add_to_order')}
                        {isAr ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
