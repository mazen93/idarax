'use client';

import React from 'react';
import { Package, Plus } from 'lucide-react';

interface POSProductGridProps {
    products: any[];
    onProductClick: (product: any) => void;
    formatCurrency: (amount: number, currencyCode?: string) => string;
    settings: any;
    t: any;
    isRTL: boolean;
}

export function POSProductGrid({
    products,
    onProductClick,
    formatCurrency,
    settings,
    t,
    isRTL
}: POSProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t('no_products')}</h3>
                <p className="text-muted-foreground max-w-sm">{t('no_products_msg') || 'Try adjusting your search or category filters.'}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-20">
                {products.map((product) => {
                    const displayName = isRTL ? (product.nameAr || product.name) : product.name;
                    const initial = displayName.charAt(0).toUpperCase();
                    
                    return (
                        <button
                            key={product.id}
                            onClick={() => onProductClick(product)}
                            className="group relative flex flex-col bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1),0_0_20px_rgba(var(--primary-rgb),0.05)] transition-all duration-500 hover:-translate-y-1 active:scale-[0.98]"
                        >
                            {/* Image / Initial Area */}
                            <div className="aspect-square w-full bg-gradient-to-br from-white/[0.02] to-transparent flex items-center justify-center overflow-hidden relative">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).onerror = null;
                                            (e.target as HTMLImageElement).src = ''; 
                                            // Trigger re-render of fallback div or just hide img
                                            (e.target as HTMLImageElement).className = 'hidden';
                                        }}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="text-5xl font-black text-foreground/20 group-hover:text-primary transition-colors duration-500 select-none">
                                        {initial}
                                    </div>
                                )}
                                {product.image && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                                
                                {/* Quick Add Overlay (Desktop hover only) */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] hidden lg:flex">
                                    <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            {/* Details Container */}
                            <div className="p-6 pt-2 flex-1 flex flex-col justify-between">
                                <div className="mb-4">
                                    <h3 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors text-sm">
                                        {displayName}
                                    </h3>
                                    {(product.variants?.length > 0 || product.modifiers?.length > 0) && (
                                        <div className="flex gap-2 mt-1.5">
                                            {product.variants?.length > 0 && (
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black bg-white/5 px-1.5 py-0.5 rounded">
                                                    {t('variants')}
                                                </span>
                                            )}
                                            {product.isCombo && (
                                                <span className="text-[9px] text-primary-500 uppercase tracking-widest font-black bg-primary-500/10 px-1.5 py-0.5 rounded border border-primary-500/20">
                                                    Combo
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-base font-black text-primary tracking-tight">
                                        {formatCurrency(Number(product.price) || 0, settings?.currency)}
                                    </span>
                                    <div className="w-10 h-10 bg-muted/20 border border-border group-hover:bg-primary group-hover:border-primary/40 text-muted-foreground group-hover:text-primary-foreground rounded-2xl flex items-center justify-center transition-all duration-500">
                                        <Plus className="w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Status indicator */}
                            <div className="absolute top-4 right-4 group-hover:scale-125 transition-transform duration-500">
                               <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
