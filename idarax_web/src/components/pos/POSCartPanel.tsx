'use client';

import React from 'react';
import { 
    ShoppingCart, User, MapPin, Trash2, Plus, Minus, Tag, MessageSquare, 
    CreditCard, Banknote, History, ArrowLeft, MoreHorizontal, UserPlus,
    ClipboardList, Lock as LockIcon, Clock
} from 'lucide-react';
import { OrderType, CartItem } from '../../types/pos';

interface POSCartPanelProps {
    cart: CartItem[];
    customers: any[];
    tables: any[];
    rewardCatalog: any[];
    selectedCustomer: any;
    setSelectedCustomer: (c: any) => void;
    selectedTable: string;
    setSelectedTable: (val: string) => void;
    orderType: OrderType;
    setOrderType: (type: OrderType) => void;
    note: string;
    setNote: (v: string) => void;
    financials: {
        subtotal: number;
        tax: number;
        discount: number;
        serviceFeeAmount: number;
        loyaltyCashback: number;
        total: number;
    };
    paymentMethod: 'CASH' | 'CARD' | 'SPLIT';
    setPaymentMethod: (m: 'CASH' | 'CARD' | 'SPLIT') => void;
    splitPayments: any[];
    setSplitPayments: (v: any[]) => void;
    submitting: boolean;
    activeOrderId: string | null;
    onCheckout: () => void;
    onSaveToTable: () => void;
    onClearCart: () => void;
    onUpdateQty: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onUpdateItemNote: (id: string, note: string) => void;
    onUpdateItemCourse: (cartId: string, course: string) => void;
    onAddCustomer: () => void;
    onShowParked: () => void;
    onShowRecent: () => void;
    onLock: () => void;
    onVoidOrder: () => void;
    onOpenSchedule: () => void;
    onParkPreOrder: () => void;
    scheduledAt: Date | null;
    t: any;
    isRTL: boolean;
    formatCurrency: (amount: number, currencyCode?: string) => string;
    settings: any;
    loyaltyPointsToRedeem: number;
    setLoyaltyPointsToRedeem: (v: number) => void;
    redeemAsCashback: boolean;
    setRedeemAsCashback: (v: boolean) => void;
    autoSendEmail: boolean;
    setAutoSendEmail: (v: boolean) => void;
    receiptEmail: string;
    setReceiptEmail: (v: string) => void;
    appliedOffer: any;
    applyOffer: (code: string) => Promise<boolean>;
    removeOffer: () => void;
    isApplyingOffer: boolean;
    autoPromos: any[];
    upsells: any[];
    onUpsellClick: (p: any) => void;
    onUpdateItemPrice: (id: string, newPrice: number | undefined) => void;
    lastAddedId?: string | null;
    parkedOrders: any[];
    onManualSkuAdd: (sku: string) => void;
}

export function POSCartPanel({
    cart,
    customers,
    tables,
    rewardCatalog,
    selectedCustomer,
    setSelectedCustomer,
    selectedTable,
    setSelectedTable,
    orderType,
    setOrderType,
    note,
    setNote,
    financials,
    paymentMethod,
    setPaymentMethod,
    splitPayments,
    setSplitPayments,
    submitting,
    activeOrderId,
    onCheckout,
    onSaveToTable,
    onClearCart,
    onUpdateQty,
    onRemoveItem,
    onUpdateItemNote,
    onUpdateItemCourse,
    onAddCustomer,
    onShowParked,
    onShowRecent,
    onLock,
    onVoidOrder,
    onOpenSchedule,
    onParkPreOrder,
    scheduledAt,
    t,
    isRTL,
    formatCurrency,
    settings,
    loyaltyPointsToRedeem,
    setLoyaltyPointsToRedeem,
    redeemAsCashback,
    setRedeemAsCashback,
    autoSendEmail,
    setAutoSendEmail,
    receiptEmail,
    setReceiptEmail,
    appliedOffer,
    applyOffer,
    removeOffer,
    isApplyingOffer,
    autoPromos,
    upsells,
    onUpsellClick,
    onUpdateItemPrice,
    lastAddedId,
    parkedOrders,
    onManualSkuAdd
}: POSCartPanelProps) {
    const { subtotal, tax, discount, serviceFeeAmount, loyaltyCashback, total } = financials;
    const [expandedNoteItemId, setExpandedNoteItemId] = React.useState<string | null>(null);
    const [editingPriceId, setEditingPriceId] = React.useState<string | null>(null);
    const [overridePriceValue, setOverridePriceValue] = React.useState<string>('');
    const [tenderedAmount, setTenderedAmount] = React.useState<string>('');

    React.useEffect(() => {
        if (cart.length === 0) setTenderedAmount('');
    }, [cart.length]);

    return (
        <aside className="w-[450px] bg-card border border-border flex flex-col h-full rounded-[2.5rem] overflow-hidden shadow-2xl relative z-20">
            {/* Header section - Compact */}
            <div className="p-4 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                        {t('cart')}
                        <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-lg">{cart.length}</span>
                    </h2>
                </div>
                <div className="flex gap-1.5">
                    <button onClick={onLock} className="p-2 bg-muted/30 rounded-lg hover:bg-warning-500/10 text-muted-foreground hover:text-warning-500 transition-all" title="Lock POS">
                        <LockIcon className="w-4 h-4" />
                    </button>
                    <button onClick={onShowParked} className="p-2 bg-muted/30 rounded-lg hover:bg-muted text-muted-foreground transition-all">
                        <ClipboardList className="w-4 h-4" />
                    </button>
                    <button onClick={onShowRecent} className="p-2 bg-muted/30 rounded-lg hover:bg-muted text-muted-foreground transition-all">
                        <History className="w-4 h-4" />
                    </button>
                    <button onClick={onClearCart} className="p-2 bg-muted/30 rounded-lg hover:bg-error-500/10 text-muted-foreground hover:text-error-500 transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    {settings?.preOrderEnabled && (
                        <button 
                            onClick={onOpenSchedule} 
                            className={`p-2 rounded-lg transition-all ${
                                scheduledAt 
                                ? 'bg-primary text-primary-foreground shadow-lg scale-110' 
                                : 'bg-muted/30 hover:bg-muted text-muted-foreground'
                            }`}
                            title={t('schedule_order') || 'Schedule Order'}
                        >
                            <Clock className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Manual SKU Input */}
            <div className="px-5 py-2 border-b border-border/50 bg-muted/5">
                <div className="relative group">
                    <input 
                        type="text"
                        placeholder="Scan or enter barcode / SKU..."
                        className="w-full bg-card border border-border rounded-xl pl-9 pr-16 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 font-mono shadow-sm transition-all placeholder:font-sans"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (e.currentTarget.value.trim()) {
                                    onManualSkuAdd(e.currentTarget.value.trim());
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 group-focus-within:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black uppercase text-muted-foreground border border-border bg-muted px-1.5 py-0.5 rounded">
                            ENTER ↵
                        </span>
                    </div>
                </div>
            </div>

            {/* Selection Row: Customer & Table - Super Compact */}
            <div className={`px-5 py-3 flex flex-col gap-2 ${scheduledAt ? 'bg-primary/5 border-b border-primary/10' : ''}`}>
                {scheduledAt && (
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl mb-1 animate-in slide-in-from-top-1">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                                {t('scheduled_for') || 'Scheduled For'}: {scheduledAt.toLocaleDateString()} {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <button 
                            onClick={onOpenSchedule}
                            className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest"
                        >
                            {t('change') || 'Change'}
                        </button>
                    </div>
                )}
                <div className="flex gap-2">
                <div className="flex-1 relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary z-10" />
                    <div className="relative">
                        <button
                            onClick={() => {
                                const el = document.getElementById('customer-dropdown');
                                if (el) el.classList.toggle('hidden');
                            }}
                            className={`w-full h-9 bg-muted/20 border rounded-xl pl-9 pr-2 text-left text-[11px] transition-all flex items-center ${
                                selectedCustomer 
                                ? 'border-primary/30 text-foreground font-bold' 
                                : 'border-border text-muted-foreground'
                            }`}
                        >
                            <span className="truncate">{selectedCustomer ? selectedCustomer.name : t('walk_in')}</span>
                        </button>
                        
                        {/* Dropdown Popover */}
                        <div id="customer-dropdown" className="hidden absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl z-[100] max-h-60 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-border flex items-center gap-2">
                                <input 
                                    type="text"
                                    placeholder={t('search_customers')}
                                    className="flex-1 bg-muted/20 border border-border rounded-lg px-3 py-1.5 text-[10px] text-foreground focus:outline-none focus:border-primary/50"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                        const term = e.target.value.toLowerCase();
                                        const items = document.querySelectorAll('.customer-item');
                                        items.forEach((item: any) => {
                                            const name = item.dataset.name.toLowerCase();
                                            const phone = item.dataset.phone.toLowerCase();
                                            if (name.includes(term) || phone.includes(term)) item.classList.remove('hidden');
                                            else item.classList.add('hidden');
                                        });
                                    }}
                                />
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddCustomer();
                                        document.getElementById('customer-dropdown')?.classList.add('hidden');
                                    }}
                                    className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                <button
                                    onClick={() => {
                                        setSelectedCustomer(null);
                                        document.getElementById('customer-dropdown')?.classList.add('hidden');
                                    }}
                                    className="w-full px-4 py-2 text-left text-[10px] text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    {t('walk_in')}
                                </button>
                                {customers.map(c => (
                                    <button
                                        key={c.id}
                                        data-name={c.name}
                                        data-phone={c.phone || ''}
                                        onClick={() => {
                                            setSelectedCustomer(c);
                                            document.getElementById('customer-dropdown')?.classList.add('hidden');
                                        }}
                                        className="customer-item w-full px-4 py-2 text-left text-[10px] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border-t border-border"
                                    >
                                        <div className="font-bold">{c.name}</div>
                                        {c.phone && <div className="text-[9px] opacity-60">{c.phone}</div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative group">
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="h-9 bg-muted/20 border border-border rounded-xl px-9 text-muted-foreground text-[11px] focus:outline-none focus:border-primary/50 appearance-none min-w-[120px]"
                    >
                        <option value="" className="bg-[var(--background)]">{t('no_table')}</option>
                        {tables.map(table => (
                            <option key={table.id} value={table.id} className="bg-[var(--background)]">
                                {t('table')} {table.number} {table.status === 'OCCUPIED' ? `(${t('busy') || 'Busy'})` : ''}
                            </option>
                        ))}
                    </select>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-primary pointer-events-none" />
                </div>
                {selectedTable && activeOrderId && (
                    <button 
                        onClick={() => {
                            const order = parkedOrders.find((o: any) => o.id === activeOrderId);
                            if (order) {
                                const tenantInfo = { name: localStorage.getItem('tenant_name') || 'Restaurant' };
                                require('@/utils/printUtils').printOrderReceipt(tenantInfo, order, settings);
                            }
                        }}
                        className="p-2 bg-warning-500/10 text-warning-500 rounded-xl hover:bg-warning-500 hover:text-white transition-all flex items-center justify-center h-9"
                        title={t('print_bill') || 'Print Bill'}
                    >
                        <History className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
            
            {/* Order Note Section - New */}
            <div className="px-5 mb-1">
                {note ? (
                    <div className="relative group animate-in slide-in-from-top-1">
                        <input 
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full h-8 bg-primary/5 border border-primary/20 rounded-xl pl-8 pr-8 text-[10px] text-primary placeholder:text-success-900/40 focus:outline-none focus:border-primary/40 transition-all font-bold"
                            placeholder={t('order_note') || 'Whole order note...'}
                        />
                        <ClipboardList className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/60" />
                        <button 
                            onClick={() => setNote('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-success-900/40 hover:text-error-500 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setNote(' ')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-primary transition-all ml-1 group"
                    >
                        <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
                        {t('add_order_note') || 'Add Order Note'}
                    </button>
                )}
            </div>

            {/* Cart Items List - Enhanced Space */}
            <div className="flex-1 overflow-y-auto px-5 py-1 space-y-2.5 scrollbar-hide">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                        <ShoppingCart className="w-12 h-12 mb-2 text-zinc-700" />
                        <p className="font-black text-zinc-600 uppercase tracking-[0.2em] text-[10px]">{t('cart_empty')}</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div
                            key={item.cartId}
                            className={`group p-2.5 rounded-[1.5rem] transition-all relative overflow-hidden border ${
                                item.cartId === lastAddedId 
                                ? 'item-just-added' 
                                : item.isSaved 
                                    ? 'bg-primary/[0.03] border-primary/10 opacity-70 hover:opacity-100' 
                                    : 'bg-muted/10 border-border hover:bg-muted/30'
                            }`}
                        >
                            {item.isSaved && (
                                <div className="absolute top-0 right-0 py-0.5 px-2 bg-primary/20 text-primary text-[7px] font-black uppercase tracking-widest rounded-bl-lg">
                                    {t('already_ordered') || 'Ordered'}
                                </div>
                            )}
                            <div className="flex items-start justify-between">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-xs text-foreground leading-tight">
                                        {isRTL ? (item.nameAr || item.name) : item.name}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                setEditingPriceId(editingPriceId === item.cartId ? null : item.cartId);
                                                setOverridePriceValue((item.overridePrice ?? item.price).toString());
                                            }}
                                            className={`font-black text-[10px] transition-all hover:scale-105 active:scale-95 ${item.overridePrice !== undefined ? 'text-warning-500' : 'text-primary'}`}
                                            title="Click to override price"
                                        >
                                            {formatCurrency(item.overridePrice ?? item.price, settings?.currency)}
                                            {item.overridePrice !== undefined && <span className="ml-1 text-[7px] opacity-70 border border-warning-500/30 px-1 rounded uppercase tracking-tighter">Modified</span>}
                                        </button>
                                    </div>
                                    {(item.variantName || (item.modifiers && item.modifiers.length > 0)) && (
                                        <p className="text-[9px] text-zinc-600 font-medium">
                                            {item.variantName && <span>{isRTL ? (item.variantNameAr || item.variantName) : item.variantName}</span>}
                                            {item.modifiers && item.modifiers.map(m => isRTL ? (m.nameAr || m.name) : m.name).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded-lg border border-border">
                                    <button
                                        onClick={() => onUpdateQty(item.cartId, -1)}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-muted/50 rounded text-muted-foreground transition-colors"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-[10px] font-black text-foreground">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQty(item.cartId, 1)}
                                        className="w-6 h-6 flex items-center justify-center hover:bg-muted/50 rounded text-primary transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 pl-2">
                                     <div className="flex gap-1 items-center">
                                        <button
                                            onClick={() => setExpandedNoteItemId(expandedNoteItemId === item.cartId ? null : item.cartId)}
                                            className={`p-1.5 rounded-lg transition-all ${item.note ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                                        >
                                            <MessageSquare className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onRemoveItem(item.cartId)}
                                            className="p-1.5 text-muted-foreground hover:text-error-500 hover:bg-error-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                     </div>
                                </div>
                            </div>

                            {/* Item Note Input Panel */}
                            {(expandedNoteItemId === item.cartId || item.note) && (
                                <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                                    <div className="relative group">
                                        <input 
                                            type="text"
                                            value={item.note || ''}
                                            onChange={(e) => onUpdateItemNote(item.cartId, e.target.value)}
                                            placeholder={t('add_note') || 'Item note...'}
                                            autoFocus={expandedNoteItemId === item.cartId}
                                            className="w-full bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 transition-all"
                                        />
                                        <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground group-focus-within:text-primary/30" />
                                    </div>
                                </div>
                            )}

                            {/* Price Override Popover */}
                            {editingPriceId === item.cartId && (
                                <div className="mt-2 p-3 bg-muted/50 border border-warning-500/20 rounded-xl animate-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-warning-500">Override Price</span>
                                        <button 
                                            onClick={() => {
                                                onUpdateItemPrice(item.cartId, undefined);
                                                setEditingPriceId(null);
                                            }}
                                            className="text-[8px] font-black text-muted-foreground hover:text-error-500 uppercase transition-colors"
                                        >
                                            Reset to Default
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">{settings?.currency}</span>
                                            <input 
                                                type="number"
                                                step="0.01"
                                                value={overridePriceValue}
                                                onChange={(e) => setOverridePriceValue(e.target.value)}
                                                autoFocus
                                                className="w-full h-9 bg-card border border-border rounded-lg pl-8 pr-3 text-sm font-bold text-foreground focus:outline-none focus:border-warning-500/50"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        onUpdateItemPrice(item.cartId, parseFloat(overridePriceValue));
                                                        setEditingPriceId(null);
                                                    }
                                                    if (e.key === 'Escape') setEditingPriceId(null);
                                                }}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => {
                                                onUpdateItemPrice(item.cartId, parseFloat(overridePriceValue));
                                                setEditingPriceId(null);
                                            }}
                                            className="px-4 bg-warning-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-warning-600 transition-all"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            {(autoPromos.length > 0 || appliedOffer) && (
                <div className="mt-4 mx-1 p-3 bg-warning-500/5 border border-warning-500/15 rounded-2xl animate-in slide-in-from-bottom-1 duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-3 h-3 text-warning-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-warning-500">
                            {t('available_deals') || 'Deals'}
                        </span>
                    </div>
                    {autoPromos.map((promo, idx) => (
                        <div key={idx} className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] text-warning-200/50 font-medium flex items-center gap-1.5">
                                <div className="w-0.5 h-0.5 rounded-full bg-warning-500" />
                                {promo.name || 'Auto-applied reward'}
                            </span>
                        </div>
                    ))}
                    {appliedOffer && (
                         <div className="flex items-center justify-between mt-1 pt-1 border-t border-warning-500/5 text-[9px]">
                            <span className="text-primary font-bold uppercase">{appliedOffer.code}</span>
                            <button onClick={removeOffer} className="text-error-500 font-bold hover:underline">{t('remove')}</button>
                         </div>
                    )}
                </div>
            )}

            {/* AI Recommendations - Compact */}
            {upsells.length > 0 && (
                <div className="mt-4 mx-1 mb-2 p-3 bg-primary/5 border border-primary/10 rounded-2xl overflow-hidden relative">
                    <div className="flex items-center gap-2 mb-2">
                         <Plus className="w-3 h-3 text-primary" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-primary">{t('complete_meal') || 'Upsell Suggestions'}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {upsells.map((p) => (
                            <button 
                                key={p.id}
                                onClick={() => onUpsellClick(p)}
                                className="flex-shrink-0 w-20 p-2 bg-muted/40 border border-border rounded-xl hover:border-primary/30 transition-all text-left"
                            >
                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-white/5 mb-1">
                                    {p.image && <img src={p.image} className="w-full h-full object-cover" alt="" />}
                                </div>
                                <div className="text-[8px] font-bold text-foreground truncate line-clamp-1 leading-tight mb-0.5">{isRTL ? (p.nameAr || p.name) : p.name}</div>
                                <div className="text-[8px] text-primary font-black">{formatCurrency(p.price, settings?.currency)}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            </div>

            {/* Financials & Action - High Density */}
            <div className="p-4 bg-card border-t border-border space-y-3 flex-shrink-0 pb-5">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="relative flex-1 max-w-[160px]">
                        <input 
                            type="text" 
                            placeholder={t('promo_code')}
                            className="w-full h-7 bg-muted/20 border border-border rounded-lg px-2 text-[9px] focus:outline-none focus:border-primary/50"
                        />
                    </div>
                    <button className="px-3 h-7 bg-muted/20 hover:bg-muted/30 text-foreground text-[8px] font-black uppercase tracking-widest rounded-lg border border-border transition-all">
                        {t('apply')}
                    </button>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-muted-foreground text-[9px] font-bold uppercase tracking-widest">
                        <span>{t('subtotal')}</span>
                        <span>{formatCurrency(subtotal, settings?.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground text-[9px] font-bold uppercase tracking-widest">
                        <span>{t('vat')}</span>
                        <span>{formatCurrency(tax, settings?.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                        <span className="text-base font-black text-foreground uppercase tracking-tighter">{t('total')}</span>
                        <span className="text-2xl font-black text-primary tracking-tighter">
                            {formatCurrency(total, settings?.currency)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 pt-0.5">
                    <div className="flex bg-muted/40 p-0.5 rounded-xl border border-border">
                        <button
                            onClick={() => setPaymentMethod('CASH')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                                paymentMethod === 'CASH' 
                                ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Banknote className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{t('cash')}</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('CARD')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                                paymentMethod === 'CARD' 
                                ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <CreditCard className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{t('card')}</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('SPLIT')}
                            className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all text-[8px] font-black uppercase tracking-widest ${
                                paymentMethod === 'SPLIT' 
                                ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t('split')}
                        </button>
                    </div>

                    {/* Cash Tendered & Change Area */}
                    {paymentMethod === 'CASH' && total > 0 && (
                        <div className="bg-muted/10 p-2.5 rounded-xl border border-border space-y-2 animate-in slide-in-from-top-1">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-primary">
                                <span>{t('cash_tendered') || 'Cash Tendered'}</span>
                                {Number(tenderedAmount) > total && (
                                    <span className="text-warning-400">
                                        {t('change_due') || 'Change'}: {formatCurrency(Number(tenderedAmount) - total, settings?.currency)}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder={t('amount_received') || 'Amount received...'}
                                    value={tenderedAmount}
                                    onChange={(e) => setTenderedAmount(e.target.value)}
                                    className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-bold outline-none focus:border-primary transition-colors"
                                />
                                <button 
                                    onClick={() => setTenderedAmount(total.toString())}
                                    className="px-3 bg-muted/20 hover:bg-muted/30 border border-border rounded-lg text-[10px] font-black text-foreground uppercase tracking-widest transition-all"
                                >
                                    {t('exact') || 'Exact'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        {selectedTable && (
                            <button
                                disabled={submitting || cart.every(i => i.isSaved) || cart.length === 0}
                                onClick={onSaveToTable}
                                className={`flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                                    cart.some(i => !i.isSaved) && cart.length > 0
                                    ? 'bg-primary border-primary text-primary-foreground shadow-lg'
                                    : 'bg-muted/20 border-border text-muted-foreground'
                                }`}
                            >
                                {submitting ? <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mx-auto" /> : (t('send_to_table') || 'Send to Table')}
                            </button>
                        )}
                        <button
                            disabled={submitting || cart.length === 0}
                            onClick={onCheckout}
                            className={`${selectedTable || scheduledAt ? 'flex-1' : 'w-full'} h-12 bg-primary hover:bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-success-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {submitting ? (
                                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <span>{t('pay')} {formatCurrency(total, settings?.currency)}</span>
                            )}
                        </button>
                        {!selectedTable && scheduledAt && (
                            <button
                                disabled={submitting || cart.length === 0}
                                onClick={onParkPreOrder}
                                className="flex-1 h-12 bg-muted/20 hover:bg-muted/30 border border-border text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
                                        {t('park_scheduled') || 'Park Unpaid'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

function RefreshCw({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
        </svg>
    );
}
