'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';
import ManagerOverrideModal from '@/components/ManagerOverrideModal';
import { isRetail } from '@/utils/auth';

// Components
import { POSProductGrid } from '@/components/pos/POSProductGrid';
import { POSCartPanel } from '@/components/pos/POSCartPanel';
import { POSModifierModal } from '@/components/pos/POSModifierModal';
import { POSVariantPicker } from '@/components/pos/POSVariantPicker';
import { POSOrdersModals } from '@/components/pos/POSOrdersModals';
import { POSSuccessModal } from '@/components/pos/POSSuccessModal';
import ShiftAndDrawerSetup from '@/components/pos/ShiftAndDrawerSetup';
import { AddCustomerModal } from '@/components/pos/AddCustomerModal';
import POSPreOrderModal from '@/components/pos/POSPreOrderModal';
import CashReconciliationModal from '@/components/pos/CashReconciliationModal';
import { QuickAssignModal } from '@/components/pos/QuickAssignModal';
import { playErrorBuzzer } from '@/utils/audio';
import PosDeviceGate from '@/components/pos/PosDeviceGate';

// Hooks
import { usePOSData } from '@/hooks/usePOSData';
import { usePOSCart } from '@/hooks/usePOSCart';
import { usePOSCheckout } from '@/hooks/usePOSCheckout';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

// Types
import { OrderType } from '@/types/pos';

function POSContent() {
    const { t, language, isRTL, formatCurrency } = useLanguage();
    const isOnline = useOnlineStatus();
    const { showAlert, showConfirm } = useModal();
    const searchParams = useSearchParams();

    // UI state
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedMenuId, setSelectedMenuId] = useState<string>('all');
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [showModifierPicker, setShowModifierPicker] = useState<{ product: any, variant?: any } | null>(null);
    const [showVariantPicker, setShowVariantPicker] = useState<any>(null);
    const [showParkedOrders, setShowParkedOrders] = useState(false);
    const [showRecentOrders, setShowRecentOrders] = useState(false);
    const [overrideAction, setOverrideAction] = useState<{ action: string, callback: (token: string) => void } | null>(null);
    const [showReconciliationModal, setShowReconciliationModal] = useState(false);
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [showPreOrderModal, setShowPreOrderModal] = useState(false);
    const [placeholder, setPlaceholder] = useState<string>(''); // For dummy state trigger if needed
    const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
    const [showQuickAssignModal, setShowQuickAssignModal] = useState(false);

    const {
        products,
        categories,
        menus,
        customers,
        tables,
        rewardCatalog,
        settings,
        usingCache,
        setCustomers,
        refetchTables,
        refreshData
    } = usePOSData();

    // Orchestration State
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [orderType, setOrderType] = useState<OrderType>(OrderType.IN_STORE);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'SPLIT'>('CASH');
    const [splitPayments, setSplitPayments] = useState<{ method: 'CASH' | 'CARD', amount: string }[]>([
        { method: 'CASH', amount: '0' },
        { method: 'CARD', amount: '0' }
    ]);
    const [note, setNote] = useState('');
    const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);
    const [redeemAsCashback, setRedeemAsCashback] = useState(false);
    const [autoSendEmail, setAutoSendEmail] = useState(false);
    const [receiptEmail, setReceiptEmail] = useState('');

    // Cart Hook
    const {
        cart,
        lastAddedId,
        setCart,
        addToCart,
        updateQty,
        removeFromCart,
        updateItemNote,
        updateItemCourse,
        updateItemPrice,
        clearCart,
        financials,
        appliedOffer,
        applyOffer,
        removeOffer,
        isApplyingOffer,
        autoPromos,
        upsells
    } = usePOSCart(settings, orderType, selectedTable, selectedCustomer);
    
    const [parkedOrdersState, setParkedOrdersState] = useState<any[]>([]);
    const handleCheckoutError = useCallback((message: string) => {
        if (message.toLowerCase().includes('shift') || message.toLowerCase().includes('drawer')) {
            setShowSetupModal(true);
        } else {
            showAlert({ message, variant: 'DANGER', title: 'Order Failed' });
        }
    }, [showAlert]);

    // Context & Checkout Hook
    const checkoutContext = {
        cart,
        selectedCustomer,
        selectedTable,
        paymentMethod,
        splitPayments,
        orderType,
        note,
        financials,
        appliedOffer,
        loyaltyPointsToRedeem,
        redeemAsCashback,
        settings,
        clearCart,
        setCart,
        setSelectedTable,
        setNote,
        setSelectedCustomer,
        setAutoSendEmail,
        isOnline,
        fetchTables: refetchTables,
        parkedOrders: parkedOrdersState,
        setParkedOrders: setParkedOrdersState,
        scheduledAt,
        setScheduledAt,
        onError: handleCheckoutError
    };

    const {
        submitting,
        lastOrder,
        showSuccess,
        setShowSuccess,
        isOfflineOrder,
        offlineQueueCount,
        syncToast,
        parkedOrders,
        recentOrders,
        activeOrderId,
        setActiveOrderId,
        processCheckout,
        saveToTable,
        parkPreOrder,
        fetchParkedOrders,
        fetchRecentOrders,
        fireOrder,
        voidOrder,
        repeatOrder,
        sendReceiptEmail
    } = usePOSCheckout(checkoutContext);

    // Barcode/SKU Lookup Logic (Shared between physical scanner and manual entry)
    const handleAddByBarcode = useCallback((code: string) => {
        const product = products.find(p => p.barcode === code || p.sku === code);
        if (product) {
            if (product.variants?.length > 0) {
                setShowVariantPicker(product);
            } else if (product.modifiers?.length > 0) {
                setShowModifierPicker({ product });
            } else {
                addToCart(product);
            }
        } else if (code.length >= 3) {
            // Quick Assign Workflow for Retail
            playErrorBuzzer();
            setPendingBarcode(code);
            setShowQuickAssignModal(true);
        }
    }, [products, addToCart]);

    useBarcodeScanner(handleAddByBarcode);

    // Initial logic
    useEffect(() => {
        const tableId = searchParams.get('tableId');
        if (tableId) {
            setSelectedTable(tableId);
            setOrderType(OrderType.DINE_IN);
        }

        const userRole = localStorage.getItem('user_role')?.toUpperCase();
        if (userRole && !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
            setShowSetupModal(true);
        }
    }, [searchParams]);

    const handleShowRecent = useCallback(() => {
        setShowRecentOrders(true);
        fetchRecentOrders?.();
    }, [fetchRecentOrders]);

    const handleShowParked = useCallback(() => {
        setShowParkedOrders(true);
        fetchParkedOrders?.();
    }, [fetchParkedOrders]);

    useEffect(() => {
        window.addEventListener('showRecentOrders', handleShowRecent);
        window.addEventListener('showParkedOrders', handleShowParked);
        return () => {
            window.removeEventListener('showRecentOrders', handleShowRecent);
            window.removeEventListener('showParkedOrders', handleShowParked);
        };
    }, [handleShowRecent, handleShowParked]);

    // Initial recall logic
    useEffect(() => {
        fetchParkedOrders?.();
        fetchRecentOrders?.();
    }, [fetchParkedOrders, fetchRecentOrders]);

    // Handle Search/Filter
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                             (p.nameAr && p.nameAr.includes(search));
        const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
        
        // If a specific menu is selected, we must check if the product's category belongs to that menu
        let matchesMenu = true;
        if (selectedMenuId !== 'all') {
            const currentMenu = menus.find(m => m.id === selectedMenuId);
            const menuCategoryIds = (currentMenu?.categories || []).map((mc: any) => mc.categoryId);
            matchesMenu = menuCategoryIds.includes(p.categoryId);
        }

        return matchesSearch && matchesCategory && matchesMenu;
    });

    // Automatic recall on table select — only recall HELD (parked) orders
    useEffect(() => {
        if (!selectedTable) return;
        
        // Only recall orders that are still actively HELD (parked to the table)
        const matchingOrder = parkedOrders.find(
            (o: any) => o.tableId === selectedTable && o.status === 'HELD'
        );
        if (matchingOrder && activeOrderId !== matchingOrder.id) {
            const items = (matchingOrder.items || []).map((it: any) => ({
                cartId: crypto.randomUUID(),
                productId: it.productId,
                name: it.product.name,
                nameAr: it.product.nameAr,
                price: parseFloat(it.price),
                quantity: it.quantity,
                isSaved: true,
                note: it.note,
                modifiers: (it.modifiers || []).map((m: any) => ({ 
                    optionId: m.optionId, 
                    name: m.option?.name, 
                    nameAr: m.option?.nameAr,
                    price: parseFloat(m.price || 0) 
                }))
            }));
            setCart(items);
            setActiveOrderId(matchingOrder.id);
        }
    }, [selectedTable, parkedOrders, activeOrderId, setCart, setActiveOrderId]);

    const filteredCategories = categories.filter(c => {
        if (selectedMenuId === 'all') return true;
        const currentMenu = menus.find(m => m.id === selectedMenuId);
        const menuCategoryIds = (currentMenu?.categories || []).map((mc: any) => mc.categoryId);
        return menuCategoryIds.includes(c.id);
    });

    return (
        <div className={`h-screen w-full flex flex-col bg-background text-foreground font-sans selection:bg-primary/30 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <PosDeviceGate>
                {/* Lock screen is managed globally by DashboardLayout */}
            
            <ShiftAndDrawerSetup 
                isOpen={showSetupModal} 
                onClose={() => setShowSetupModal(false)} 
                onComplete={() => setShowSetupModal(false)}
                t={t} 
                isRTL={isRTL} 
            />

            <div className="flex-1 flex overflow-hidden lg:p-6 gap-6">
                
                {/* Main Content: Search + Grid */}
                <div className="flex-1 flex flex-col min-w-0 gap-6 overflow-hidden">
                    
                    {/* Top Bar: Search & Status */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="relative group flex-1">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="search"
                                placeholder={t('search_products')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-14 bg-card border border-border rounded-2xl pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-success/10 transition-all font-medium"
                            />
                        </div>

                        {/* Order Type Tabs */}
                        <div className="flex bg-card p-1.5 rounded-2xl border border-border no-scrollbar overflow-x-auto whitespace-nowrap">
                            {[OrderType.DINE_IN, OrderType.TAKEAWAY, OrderType.DELIVERY, OrderType.DRIVE_THRU, OrderType.CURBSIDE, OrderType.IN_STORE]
                                .filter(type => isRetail() ? type !== OrderType.DINE_IN : true)
                                .map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setOrderType(type)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                                        orderType === type 
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {t(`order_type_${type.toLowerCase()}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Menu selection Pills - NEW */}
                    {menus.length > 0 && (
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 flex-shrink-0 mb-1">
                            <button
                                onClick={() => setSelectedMenuId('all')}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                    selectedMenuId === 'all'
                                    ? 'bg-warning-500 border-warning-500 text-white shadow-lg shadow-warning-900/20'
                                    : 'bg-card text-zinc-600 border-border hover:text-zinc-400'
                                }`}
                            >
                                {t('all_menus') || 'All Menus'}
                            </button>
                            {menus.map((menu) => (
                                <button
                                    key={menu.id}
                                    onClick={() => setSelectedMenuId(menu.id)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                        selectedMenuId === menu.id
                                        ? 'bg-warning-500 border-warning-500 text-white shadow-lg shadow-warning-900/20'
                                        : 'bg-card text-zinc-600 border-border hover:text-zinc-400'
                                    }`}
                                >
                                    {language === 'ar' ? (menu.nameAr || menu.name) : menu.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Category Pills */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 flex-shrink-0">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                selectedCategory === 'all'
                                ? 'bg-primary text-white'
                                : 'bg-card text-muted-foreground hover:bg-white/5 hover:text-zinc-300 border border-border'
                            }`}
                        >
                            {t('all')}
                        </button>
                        {filteredCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2.5 overflow-hidden ${
                                    selectedCategory === cat.id
                                    ? 'bg-primary text-white shadow-lg shadow-success-900/20'
                                    : 'bg-card text-muted-foreground hover:bg-white/5 hover:text-zinc-300 border border-border'
                                }`}
                            >
                                {cat.image ? (
                                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                                        <img src={cat.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                        {(language === 'ar' ? (cat.nameAr || cat.name) : cat.name).charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span>{language === 'ar' ? (cat.nameAr || cat.name) : cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <POSProductGrid 
                        products={filteredProducts}
                        onProductClick={(p) => {
                            if (p.variants?.length > 0) setShowVariantPicker(p);
                            else if (p.modifiers?.length > 0) setShowModifierPicker({ product: p });
                            else addToCart(p);
                        }}
                        formatCurrency={formatCurrency}
                        settings={settings}
                        t={t}
                        isRTL={isRTL}
                    />
                </div>

                {/* Right: Cart Panel */}
                <POSCartPanel 
                    cart={cart}
                    customers={customers}
                    tables={tables}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    selectedTable={selectedTable}
                    setSelectedTable={(val) => {
                        setSelectedTable(val);
                        if (val) setOrderType(OrderType.DINE_IN);
                        else if (orderType === OrderType.DINE_IN) setOrderType(OrderType.IN_STORE);
                    }}
                    orderType={orderType}
                    setOrderType={setOrderType}
                    note={note}
                    setNote={setNote}
                    financials={financials}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    splitPayments={splitPayments}
                    setSplitPayments={setSplitPayments}
                    submitting={submitting}
                    activeOrderId={activeOrderId}
                    onCheckout={processCheckout}
                    onSaveToTable={saveToTable}
                    onClearCart={clearCart}
                    onUpdateQty={updateQty}
                    onRemoveItem={removeFromCart}
                    onUpdateItemNote={updateItemNote}
                    onUpdateItemCourse={updateItemCourse}
                    onUpdateItemPrice={updateItemPrice}
                    lastAddedId={lastAddedId}
                    onAddCustomer={() => setShowAddCustomerModal(true)}
                    onShowParked={() => { setShowParkedOrders(true); fetchParkedOrders(); }}
                    onShowRecent={() => { setShowRecentOrders(true); fetchRecentOrders(); }}
                    onLock={() => window.dispatchEvent(new CustomEvent('toggleLock', { detail: { locked: true } }))}
                    onVoidOrder={() => {
                        const userPermissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
                        if (!userPermissions.includes('ORDERS:CANCEL')) {
                            setOverrideAction({ action: 'ORDERS:CANCEL', callback: clearCart });
                        } else {
                            clearCart();
                        }
                    }}
                    t={t}
                    isRTL={isRTL}
                    formatCurrency={formatCurrency}
                    settings={settings}
                    rewardCatalog={rewardCatalog}
                    loyaltyPointsToRedeem={loyaltyPointsToRedeem}
                    setLoyaltyPointsToRedeem={setLoyaltyPointsToRedeem}
                    redeemAsCashback={redeemAsCashback}
                    setRedeemAsCashback={setRedeemAsCashback}
                    autoSendEmail={autoSendEmail}
                    setAutoSendEmail={setAutoSendEmail}
                    receiptEmail={receiptEmail}
                    setReceiptEmail={setReceiptEmail}
                    appliedOffer={appliedOffer}
                    applyOffer={applyOffer}
                    removeOffer={removeOffer}
                    isApplyingOffer={isApplyingOffer}
                    autoPromos={autoPromos}
                    upsells={upsells}
                    onUpsellClick={(p) => {
                        if (p.variants?.length > 0) setShowVariantPicker(p);
                        else if (p.modifiers?.length > 0) setShowModifierPicker({ product: p });
                        else addToCart(p);
                    }}
                    parkedOrders={parkedOrders}
                    scheduledAt={scheduledAt}
                    onOpenSchedule={() => setShowPreOrderModal(true)}
                    onParkPreOrder={parkPreOrder}
                    onManualSkuAdd={handleAddByBarcode}
                />
            </div>

            {/* Modals */}
            {showModifierPicker && (
                <POSModifierModal 
                    product={showModifierPicker.product}
                    variant={showModifierPicker.variant}
                    t={t}
                    isRTL={isRTL}
                    formatCurrency={formatCurrency}
                    settings={settings}
                    onClose={() => setShowModifierPicker(null)}
                    onAdd={(p, v, mods) => {
                        addToCart(p, v, mods);
                        setShowModifierPicker(null);
                    }}
                />
            )}

            {showVariantPicker && (
                <POSVariantPicker 
                    product={showVariantPicker}
                    t={t}
                    isRTL={isRTL}
                    formatCurrency={formatCurrency}
                    settings={settings}
                    onClose={() => setShowVariantPicker(null)}
                    onSelect={(p, v) => {
                        setShowVariantPicker(null);
                        if (p.modifiers?.length > 0) setShowModifierPicker({ product: p, variant: v });
                        else addToCart(p, v);
                    }}
                />
            )}

            <POSOrdersModals 
                t={t}
                isRTL={isRTL}
                formatCurrency={formatCurrency}
                settings={settings}
                showParked={showParkedOrders}
                onCloseParked={() => setShowParkedOrders(false)}
                parkedOrders={parkedOrders}
                onRecallParked={(order) => {
                    const items = (order.items || []).map((it: any) => ({
                        cartId: crypto.randomUUID(),
                        productId: it.productId,
                        name: it.product.name,
                        nameAr: it.product.nameAr,
                        price: parseFloat(it.price),
                        quantity: it.quantity,
                        isSaved: true,
                        note: it.note,
                        modifiers: (it.modifiers || []).map((m: any) => ({ 
                            optionId: m.optionId, 
                            name: m.option?.name, 
                            nameAr: m.option?.nameAr,
                            price: parseFloat(m.price || 0) 
                        }))
                    }));
                    setCart(items);
                    setActiveOrderId(order.id);
                    setSelectedTable(order.tableId || '');
                    setShowParkedOrders(false);
                }}
                onFireParked={fireOrder}
                onVoidParked={(id) => {
                    const userPermissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
                    if (!userPermissions.includes('ORDERS:CANCEL')) {
                        setOverrideAction({ action: 'ORDERS:CANCEL', callback: () => voidOrder(id) });
                    } else {
                        voidOrder(id);
                    }
                }}
                showRecent={showRecentOrders}
                onCloseRecent={() => setShowRecentOrders(false)}
                recentOrders={recentOrders}
                onRepeatRecent={repeatOrder}
                onPrintRecent={(order) => {
                    const tenantInfo = { name: localStorage.getItem('tenant_name') || 'Restaurant' };
                    const printSettings = { ...settings, printerType: 'THERMAL' }; // Example override
                    require('@/utils/printUtils').printOrderReceipt(tenantInfo, order, printSettings);
                }}
            />

            <POSSuccessModal 
                isOpen={showSuccess}
                isOffline={isOfflineOrder}
                orderId={lastOrder?.id || ''}
                orderData={lastOrder}
                t={t}
                onClose={() => setShowSuccess(false)}
                onPrint={() => {
                    const tenantInfo = { name: localStorage.getItem('tenant_name') || 'Restaurant' };
                    require('@/utils/printUtils').printOrderReceipt(tenantInfo, lastOrder, settings);
                }}
                onSendEmail={sendReceiptEmail}
                customerEmail={selectedCustomer?.email}
                isSendingEmail={submitting}
            />

            {overrideAction && (
                <ManagerOverrideModal
                    action={overrideAction.action}
                    onSuccess={(token) => {
                        overrideAction.callback(token);
                        setOverrideAction(null);
                    }}
                    onCancel={() => setOverrideAction(null)}
                />
            )}

            <AddCustomerModal
                isOpen={showAddCustomerModal}
                onClose={() => setShowAddCustomerModal(false)}
                onSuccess={(newCustomer) => {
                    setCustomers(prev => [...prev, newCustomer]);
                    setSelectedCustomer(newCustomer);
                }}
                t={t}
            />

            <CashReconciliationModal 
                isOpen={showReconciliationModal}
                onClose={() => setShowReconciliationModal(false)}
                onSuccess={() => {
                    setShowReconciliationModal(false);
                    // Refresh and possibly show setup modal again or redirect
                    refreshData();
                    setShowSetupModal(true); 
                }}
                t={t}
                isRTL={isRTL}
            />
            {showPreOrderModal && (
                <POSPreOrderModal 
                    isOpen={showPreOrderModal}
                    onClose={() => setShowPreOrderModal(false)}
                    onSave={(date, newNote) => {
                        setScheduledAt(date);
                        if (newNote !== undefined) setNote(newNote);
                        setShowPreOrderModal(false);
                    }}
                    currentScheduledAt={scheduledAt}
                    currentNote={note}
                    settings={settings}
                    t={t}
                />
            )}

            {pendingBarcode && (
                <QuickAssignModal 
                    isOpen={showQuickAssignModal}
                    onClose={() => setShowQuickAssignModal(false)}
                    barcode={pendingBarcode}
                    products={products}
                    onAssigned={(updatedProduct) => {
                        // Refresh data or update local state so products list has the new barcode
                        // addToCart will work next time. For now, we can just add it manually.
                        addToCart(updatedProduct);
                        refreshData();
                    }}
                />
            )}
            </PosDeviceGate>
        </div>
    );
}

export default function POSPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <POSContent />
        </Suspense>
    );
}
