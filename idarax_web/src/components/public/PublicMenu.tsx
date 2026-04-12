'use client';

import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Search, ChevronRight, X, Clock, MapPin, Table2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import CheckoutModal from './CheckoutModal';
import ModifierPicker from './ModifierPicker';
import OrderHistoryModal from './OrderHistoryModal';
import { History } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Props {
    tenant: any;
    categories: any[];
    branch?: any;
    branchId?: string | null;
    tableId?: string | null;
    activeOrder?: any;
    onOrderSuccess?: () => void;
}

export default function PublicMenu({ tenant, categories: categoriesProp = [], branch, branchId, tableId, activeOrder, onOrderSuccess }: Props) {
    const t = useTranslations();
    const { locale } = useParams();
    const isAr = locale === 'ar';
    
    // Ensure categories is always an array regardless of what prop is passed
    const categories = Array.isArray(categoriesProp) ? categoriesProp : [];
    const [cart, setCart] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState(categories?.[0]?.id);
    const [search, setSearch] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isBillOpen, setIsBillOpen] = useState(false);
    const [isSplitOpen, setIsSplitOpen] = useState(false);
    const [splitType, setSplitType] = useState<'EQUAL' | 'BY_ITEM' | 'BY_AMOUNT'>('EQUAL');

    useEffect(() => {
        if (Array.isArray(categories) && categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0].id);
        }
    }, [categories, activeCategory]);

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const cartCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const filteredProducts = useMemo(() => {
        const cat = categories.find(c => c.id === activeCategory);
        if (!cat) return [];
        return (cat.products || []).filter((p: any) =>
            (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.nameAr || '').includes(search) ||
            (p.description || '').toLowerCase().includes(search.toLowerCase())
        );
    }, [categories, activeCategory, search]);

    const addToCart = (product: any) => {
        // If product has modifiers or variants, open the picker instead of direct add
        if ((product.variants && product.variants.length > 0) || (product.modifiers && product.modifiers.length > 0)) {
            setSelectedProduct(product);
            return;
        }

        const uniqueId = product.id;
        setCart(prev => {
            const existing = prev.find(item => item.uniqueId === uniqueId);
            if (existing) {
                return prev.map(item =>
                    item.uniqueId === uniqueId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                uniqueId,
                productId: product.id,
                name: isAr && product.nameAr ? product.nameAr : product.name,
                price: Number(product.price),
                quantity: 1,
                modifiers: []
            }];
        });
    };

    const addComplexToCart = (item: any) => {
        const uniqueId = `${item.productId}-${item.variantId || 'base'}-${(item.modifiers || []).map((m: any) => m.optionId).sort().join('-')}`;
        
        setCart(prev => {
            const existing = prev.find(i => i.uniqueId === uniqueId);
            if (existing) {
                return prev.map(i =>
                    i.uniqueId === uniqueId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, { ...item, uniqueId }];
        });
        setSelectedProduct(null);
    };

    const removeFromCart = (uniqueId: string) => {
        setCart(prev => prev.filter(item => item.uniqueId !== uniqueId));
    };

    const updateQuantity = (uniqueId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.uniqueId === uniqueId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const filteredCategories = useMemo(() => {
        if (!Array.isArray(categories)) return [];
        if (!search) return categories;
        return categories.map(cat => ({
            ...cat,
            products: Array.isArray(cat.products) ? cat.products.filter((p: any) =>
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description?.toLowerCase().includes(search.toLowerCase())
            ) : []
        })).filter(cat => cat.products.length > 0);
    }, [categories, search]);

    const handleSplit = async () => {
        if (!activeOrder) return;
        try {
            const res = await fetch(`${API_URL}/public/order/${activeOrder.id}/split`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: splitType,
                    parts: splitType === 'EQUAL' ? 2 : undefined, // Default to 2 for equal split
                })
            });
            if (res.ok) {
                const result = await res.json();
                setIsSplitOpen(false);
                // In a real app, we'd redirect to the child order or show a list of new orders
                alert('Bill split successfully! New orders created.');
            } else {
                alert('Failed to split bill. Please try again or ask staff.');
            }
        } catch (err) {
            console.error('Split error', err);
            alert('Error splitting bill.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-slate-200 selection:bg-primary/30 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-border px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {tenant?.logoUrl ? (
                        <img src={tenant.logoUrl} alt={tenant.name || 'Restaurant'} className="w-12 h-12 rounded-xl object-contain bg-card border border-border p-1" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-bold text-xl">{tenant?.name?.[0] || 'R'}</div>
                    )}
                    <div>
                        <h1 className="font-bold text-xl text-white leading-none">{tenant?.name || 'Restaurant'}</h1>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1 uppercase tracking-wider font-semibold text-primary"><Clock className="w-3 h-3" /> Open Now</span>
                            {tableId && (
                                <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-border uppercase tracking-tighter"><Table2 className="w-3 h-3" /> Table {tableId}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-border rounded-full pl-9 pr-4 py-2.5 text-sm w-48 sm:w-64 outline-none focus:border-primary/50 transition-all font-medium"
                        />
                    </div>

                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-border rounded-full text-slate-300 transition-all hover:text-primary flex items-center gap-2"
                        title={t('my_orders')}
                    >
                        <History className="w-5 h-5" />
                        <span className="text-xs font-bold hidden md:block uppercase tracking-widest">{t('my_orders')}</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8 relative items-start">
                {/* Categories Sidebar */}
                <div className="hidden lg:block w-64 sticky top-28 space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4 mb-4">{t('categories')}</h2>
                    {Array.isArray(categories) && categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group ${activeCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary-900/40' : 'text-muted-foreground hover:text-slate-200 hover:bg-white/5'}`}
                        >
                            {isAr && cat.nameAr ? cat.nameAr : cat.name}
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === cat.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                        </button>
                    ))}
                </div>

                {/* Menu Content */}
                <div className="flex-1 space-y-12 pb-32">
                    {activeOrder && (
                        <div className="bg-primary/10 border border-primary/30 rounded-3xl p-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        {t('table_active')}
                                    </h2>
                                    <p className="text-primary-200/60 text-sm mt-1">{t('order')} #{activeOrder.receiptNumber} • {t('ongoing')}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsBillOpen(true)}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary transition-colors shadow-lg shadow-primary-900/40"
                                    >
                                        {t('view_bill')}
                                    </button>
                                    <button 
                                        onClick={() => setIsSplitOpen(true)}
                                        className="px-6 py-2.5 bg-white/10 text-white border border-border rounded-xl text-sm font-bold hover:bg-white/20 transition-colors"
                                    >
                                        {t('split_bill')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {Array.isArray(filteredCategories) && filteredCategories.map(cat => (
                        <section key={cat.id} id={cat.id} className="scroll-mt-28">
                            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                {isAr && cat.nameAr ? cat.nameAr : cat.name}
                                <div className="flex-1 h-px bg-white/5" />
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.isArray(cat.products) && cat.products.map((p: any) => (
                                    <div key={p.id} className="group bg-white/5 border border-border rounded-2xl p-4 hover:border-primary/50 hover:bg-primary/[0.03] transition-all relative">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors mb-2">{isAr && p.nameAr ? p.nameAr : p.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">{isAr && p.descriptionAr ? p.descriptionAr : (p.description || t('freshly_prepared'))}</p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-xl font-black text-white">{tenant?.currency || '$'} {Number(p.price).toFixed(2)}</span>

                                                    {cart.find(c => c.productId === p.id && !c.variantId && c.modifiers.length === 0) ? (
                                                        <div className="flex items-center bg-primary rounded-lg p-1 animate-in zoom-in-95 duration-200">
                                                            <button onClick={() => updateQuantity(p.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"><Minus className="w-4 h-4" /></button>
                                                            <span className="w-8 text-center font-bold">{cart.find(c => c.productId === p.id && !c.variantId && c.modifiers.length === 0).quantity}</span>
                                                            <button onClick={() => updateQuantity(p.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(p)}
                                                            className="bg-white/10 hover:bg-primary text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95 group/add"
                                                        >
                                                            <Plus className="w-5 h-5 group-hover/add:rotate-90 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-border">
                            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">{t('no_matching_items')}</h3>
                            <p className="text-muted-foreground">{t('try_searching_else')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Drawer Overlay (Mobile) */}
            {cartCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-300">
                    <div className="max-w-xl mx-auto bg-primary hover:bg-primary text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between transition-all cursor-pointer group"
                        onClick={() => setIsCheckoutOpen(true)}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-white text-primary-600 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ring-4 ring-primary-600 group-hover:ring-primary-500 transition-all">
                                    {cartCount}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-lg">{t('checkout_order')}</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="text-primary-200 text-xs font-medium uppercase tracking-wider">{t('subtotal')}: {tenant?.currency || '$'} {cartTotal.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black">{tenant?.currency || '$'} {cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isCheckoutOpen && (
                <CheckoutModal
                    tenant={tenant}
                    branch={branch}
                    cart={cart}
                    total={cartTotal}
                    branchId={branchId}
                    tableId={tableId}
                    onClose={() => setIsCheckoutOpen(false)}
                    onOrderSuccess={() => {
                        setCart([]);
                        if (onOrderSuccess) onOrderSuccess();
                    }}
                />
            )}
            
            {/* Modifier Picker */}
            {selectedProduct && (
                <ModifierPicker
                    product={selectedProduct}
                    currency={tenant?.currency || '$'}
                    onClose={() => setSelectedProduct(null)}
                    onAdd={addComplexToCart}
                />
            )}
            {/* Bill View Modal */}
            {isBillOpen && activeOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsBillOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#0a0a0b] rounded-[40px] border border-border p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white">Current Bill</h2>
                            <button onClick={() => setIsBillOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-4 mb-8">
                            {activeOrder.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between text-slate-300 font-bold">
                                    <span>{item.quantity}x {item.product?.name}</span>
                                    <span>{tenant?.currency || '$'} {(Number(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-border flex justify-between items-center mb-8">
                            <span className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Total Amount</span>
                            <span className="text-3xl font-black text-white">{tenant?.currency || '$'} {Number(activeOrder.totalAmount).toFixed(2)}</span>
                        </div>
                        <button 
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary transition-all shadow-xl shadow-primary-900/40"
                            onClick={() => {
                                setIsBillOpen(false);
                                setIsCheckoutOpen(true);
                            }}
                        >
                            Checkout & Pay
                        </button>
                    </div>
                </div>
            )}

            {/* Split Bill Modal (Simplified) */}
            {isSplitOpen && activeOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsSplitOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#0a0a0b] rounded-[40px] border border-border p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-white">Split the Bill</h2>
                            <button onClick={() => setIsSplitOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {['EQUAL', 'BY_ITEM'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSplitType(type as any)}
                                    className={`p-4 rounded-2xl border font-bold transition-all ${splitType === type ? 'bg-primary border-primary-400 text-white' : 'bg-white/5 border-border text-muted-foreground'}`}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <p className="text-muted-foreground text-sm mb-8">Choose how you&apos;d like to split. Choosing "EQUAL" will split the total amount into 2 parts.</p>
                        <button 
                            onClick={handleSplit}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary transition-all shadow-xl shadow-primary-900/40"
                        >
                            Confirm Split & Generate Orders
                        </button>
                    </div>
                </div>
            )}

            {/* Order History Modal */}
            {isHistoryOpen && (
                <OrderHistoryModal
                    tenant={tenant}
                    onClose={() => setIsHistoryOpen(false)}
                />
            )}
        </div>
    );
}
