'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { api } from '@/lib/api';
import { Search, Package, Plus, Check } from 'lucide-react';

interface QuickAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    barcode: string;
    products: any[];
    onAssigned: (product: any) => void;
}

export function QuickAssignModal({ isOpen, onClose, barcode, products, onAssigned }: QuickAssignModalProps) {
    const { t, language } = useLanguage();
    const [search, setSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        (p.nameAr && p.nameAr.includes(search)) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    ).slice(0, 10); // Limit to top 10 for quick selection

    const handleAssign = async (product: any) => {
        setSubmitting(true);
        try {
            await api.patch(`/retail/products/${product.id}`, { barcode });
            onAssigned({ ...product, barcode });
            onClose();
        } catch (err) {
            console.error('Failed to assign barcode:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-warning-500/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Plus className="w-8 h-8 text-warning-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Unknown Barcode</h2>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                Scanned: <span className="text-warning-500 font-bold font-mono tracking-widest">{barcode}</span>
                            </p>
                        </div>
                    </div>

                    <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                        This barcode isn't associated with any product yet. Search for a product below to assign it permanently.
                    </p>

                    <div className="relative group mb-6">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            className="w-full h-14 bg-muted/20 border border-border rounded-2xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-success/10 transition-all font-medium"
                        />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredProducts.length === 0 ? (
                            <div className="py-12 text-center opacity-40">
                                <Package className="w-12 h-12 mx-auto mb-3" />
                                <p className="text-sm font-bold uppercase tracking-widest">No products found</p>
                            </div>
                        ) : (
                            filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => handleAssign(product)}
                                    disabled={submitting}
                                    className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-left"
                                >
                                    <div className="w-12 h-12 bg-muted/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                        <Package className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-foreground truncate">
                                            {language === 'ar' ? (product.nameAr || product.name) : product.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                                            SKU: {product.sku || 'N/A'} • {product.price} {product.currency || ''}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                        {submitting ? (
                                            <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-white" />
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 bg-muted/20 border-t border-border flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
