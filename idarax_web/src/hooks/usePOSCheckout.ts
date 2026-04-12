import { useState, useCallback } from 'react';
import { api, OfflineError } from '@/lib/api';
import { OrderType, POSSettings, CartItem } from '../types/pos';
import { printOrderReceipt } from '@/utils/printUtils';
import { hasFeature } from '@/utils/auth';
import Cookies from 'js-cookie';

export function usePOSCheckout({
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
    setSelectedCustomer,
    setAutoSendEmail,
    setNote,
    isOnline,
    fetchTables,
    parkedOrders,
    setParkedOrders,
    scheduledAt,
    setScheduledAt,
    onError
}: any) {
    const [submitting, setSubmitting] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isOfflineOrder, setIsOfflineOrder] = useState(false);
    const [offlineQueueCount, setOfflineQueueCount] = useState(0);
    const [syncToast, setSyncToast] = useState<{ count: number } | null>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

    const refreshQueueCount = useCallback(async () => {
        const offlineQueue = await import('@/lib/offlineQueue');
        setOfflineQueueCount(offlineQueue.queueLength());
    }, []);

    const fetchParkedOrders = useCallback(async () => {
        try {
            const res = await api.get('/orders', { params: { status: 'HELD' } });
            setParkedOrders(res.data.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch parked orders:', err);
            setParkedOrders([]);
        }
    }, [setParkedOrders]);

    const fetchRecentOrders = useCallback(async () => {
        try {
            const res = await api.get('/orders', { params: { limit: 10 } });
            setRecentOrders(res.data.data || res.data || []);
        } catch (err) {
            console.error('Failed to fetch recent orders:', err);
        }
    }, []);

    const fireOrder = useCallback(async (id: string) => {
        try {
            await api.post(`/orders/${id}/fire`);
            fetchParkedOrders();
        } catch (err: any) {
            console.error('Failed to fire order:', err);
            const message = err.response?.data?.message || err.message || 'Failed to fire order';
            onError?.(message, err);
        }
    }, [fetchParkedOrders, onError]);

    const voidOrder = useCallback(async (id: string) => {
        try {
            await api.post(`/orders/${id}/void`);
            fetchParkedOrders();
        } catch (err: any) {
            console.error('Failed to void order:', err);
            const message = err.response?.data?.message || err.message || 'Failed to void order';
            onError?.(message, err);
        }
    }, [fetchParkedOrders, onError]);

    const repeatOrder = useCallback(async (id: string) => {
        const res = await api.get(`/orders/${id}`);
        const order = res.data;
        const items = order.items.map((it: any) => ({
            cartId: crypto.randomUUID(),
            productId: it.productId,
            name: it.product.name,
            price: parseFloat(it.price),
            quantity: it.quantity
        }));
        setCart(items);
    }, [setCart]);

    const sendReceiptEmail = useCallback(async (email: string) => {
        if (!lastOrder?.id) return;
        await api.post(`/orders/${lastOrder.id}/receipt`, { email });
    }, [lastOrder]);

    const processCheckout = useCallback(async () => {
        if (cart.length === 0) return;

        setSubmitting(true);
        setIsOfflineOrder(false);
        try {
            // When paying an existing table order (recalled from HELD), only send NEW (unsaved) items.
            // Saved items are already in the backend order — re-sending them would duplicate them.
            const isExistingTableOrder = !!activeOrderId && !!selectedTable;
            const itemsToSend = isExistingTableOrder
                ? cart.filter((c: any) => !c.isSaved)
                : cart;
            // New items total is what gets ADDED to the existing order amount.
            // For fully-saved carts this is 0, meaning we're just recording payment.
            const newItemsTotal = isExistingTableOrder
                ? itemsToSend.reduce((sum: number, c: any) => sum + ((c.overridePrice ?? c.price) * c.quantity), 0)
                : financials.total;

            const payload = {
                items: itemsToSend.map((c: any) => ({
                    productId: c.productId,
                    variantId: c.variantId || undefined,
                    quantity: c.quantity,
                    price: c.overridePrice ?? c.price,
                    note: c.note || undefined,
                    courseName: c.courseName || undefined,
                    modifiers: (c.modifiers || []).map((m: any) => ({ optionId: m.optionId })),
                    isReward: c.isReward,
                    pointsCost: c.pointsCost
                })),
                rewards: cart.flatMap((c: any) => (c.rewards || []).map((r: any) => ({
                    rewardId: r.id,
                    pointsUsed: r.pointsCost
                }))),
                totalAmount: newItemsTotal,
                customerId: selectedCustomer?.id || undefined,
                tableId: selectedTable || undefined,
                orderType,
                paymentMethod,
                note,
                paidAmount: financials.total, // Always pay the full cart total
                taxAmount: isExistingTableOrder ? 0 : financials.tax,
                serviceFeeAmount: isExistingTableOrder ? 0 : financials.serviceFeeAmount,
                splitPayments: paymentMethod === 'SPLIT' ? splitPayments.map((p: any) => ({
                    method: p.method,
                    amount: parseFloat(p.amount)
                })) : undefined,
                offerCode: appliedOffer?.code || undefined,
                discountAmount: isExistingTableOrder ? 0 : (financials.discount + financials.loyaltyCashback),
                loyaltyPointsToRedeem: redeemAsCashback ? loyaltyPointsToRedeem : undefined,
                redeemAsCashback,
                scheduledAt: scheduledAt ? scheduledAt.toISOString() : undefined,
                isPreOrder: !!scheduledAt
            };

            const res = await api.post('/orders/direct', payload);
            const orderData = res.data.data || res.data;

            setLastOrderId(orderData.id);
            setLastOrder(orderData);
            setShowSuccess(true);
            clearCart();
            setActiveOrderId(null);
            // Clear the instruction note
            setNote?.('');
            setSelectedCustomer?.(null);
            setScheduledAt?.(null);
            // Record cash drawer movement if payment is CASH or SPLIT with cash portion
            try {
                let cashAmount = 0;
                if (paymentMethod === 'CASH') {
                    cashAmount = financials.total;
                } else if (paymentMethod === 'SPLIT' && splitPayments) {
                    cashAmount = splitPayments
                        .filter((p: any) => p.method === 'CASH')
                        .reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
                }
                if (cashAmount > 0) {
                    await api.post('/staff/drawer/movement', {
                        type: 'SALE',
                        amount: cashAmount,
                        reason: `Order #${orderData.orderNumber || orderData.id}`,
                        referenceId: orderData.id,
                    });
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event('drawer-updated'));
                    }
                }
            } catch {
                // Silently ignore drawer movement errors — don't block checkout UX
            }
            // Reset table and refresh statuses so the table shows as Available
            setSelectedTable('');
            await Promise.all([fetchTables?.(), fetchParkedOrders?.()]);
        } catch (error: any) {
            if (error instanceof OfflineError || !navigator.onLine) {
                const displayOrder = {
                    id: `LOCAL-${Date.now()}`,
                    orderNumber: 'LOCAL',
                    createdAt: new Date().toISOString(),
                    totalAmount: financials.total,
                    items: cart.map((c: any) => ({
                        product: { name: c.name, nameAr: c.nameAr },
                        price: c.price,
                        quantity: c.quantity
                    }))
                };
                
                const offlineQueue = await import('@/lib/offlineQueue');
                offlineQueue.enqueue({}, displayOrder);
                
                setLastOrder(displayOrder);
                setIsOfflineOrder(true);
                setShowSuccess(true);
                clearCart();
                setScheduledAt?.(null);
                refreshQueueCount();
            } else {
                // Handle regular API errors
                const message = error.response?.data?.message || error.message || 'Something went wrong';
                if (onError) {
                    onError(message, error);
                } else {
                    console.error('Checkout error:', error);
                }
            }
        } finally {
            setSubmitting(false);
        }
    }, [cart, financials, selectedCustomer, selectedTable, orderType, paymentMethod, note, scheduledAt, splitPayments, appliedOffer, loyaltyPointsToRedeem, redeemAsCashback, activeOrderId, clearCart, fetchTables, fetchParkedOrders, refreshQueueCount, setNote, setSelectedCustomer, setSelectedTable, setScheduledAt]);

    const saveToTable = useCallback(async () => {
        // Only send items that are NOT already saved to the table
        const newItems = cart.filter((c: CartItem) => !c.isSaved);
        if (newItems.length === 0) return;
        
        // Recalculate total for ONLY the new items to avoid double-counting on the backend's increment logic
        const newItemsTotal = newItems.reduce((sum: number, item: any) => sum + ((item.overridePrice ?? item.price) * item.quantity), 0);
        
        setSubmitting(true);
        try {
            const payload = {
                items: newItems.map((c: any) => ({
                    productId: c.productId,
                    variantId: c.variantId || undefined,
                    quantity: c.quantity,
                    price: c.overridePrice ?? c.price,
                    note: c.note || undefined,
                    courseName: c.courseName || undefined,
                    modifiers: (c.modifiers || []).map((m: any) => ({ optionId: m.optionId }))
                })),
                totalAmount: newItemsTotal,
                paidAmount: 0, // Nothing is paid when sending to table (holding the order)
                tableId: selectedTable,
                orderType: OrderType.DINE_IN,
                status: 'HELD'
            };
            const res = await api.post('/orders/direct', payload);
            
            clearCart();
            setSelectedTable('');
            setActiveOrderId(null);
            
            // Refresh table statuses
            await Promise.all([fetchTables?.(), fetchParkedOrders?.()]);
        } catch (err: any) {
            console.error('Failed to save to table:', err);
            const message = err.response?.data?.message || err.message || 'Failed to save to table';
            onError?.(message, err);
        } finally {
            setSubmitting(false);
        }
    }, [cart, selectedTable, clearCart, setSelectedTable, setActiveOrderId, fetchTables, fetchParkedOrders]);

    const parkPreOrder = useCallback(async () => {
        if (cart.length === 0 || !scheduledAt) return;
        
        let newItemsTotal = 0;
        const isExistingTableOrder = !!activeOrderId && !!selectedTable;
        let itemsToSend = isExistingTableOrder ? cart.filter((c: any) => !c.isSaved) : cart;

        if (isExistingTableOrder) {
            newItemsTotal = itemsToSend.reduce((sum: number, c: any) => sum + ((c.overridePrice ?? c.price) * c.quantity), 0);
        } else {
            newItemsTotal = financials.total;
        }

        setSubmitting(true);
        try {
            const payload = {
                items: itemsToSend.map((c: any) => ({
                    productId: c.productId,
                    variantId: c.variantId || undefined,
                    quantity: c.quantity,
                    price: c.overridePrice ?? c.price,
                    note: c.note || undefined,
                    courseName: c.courseName || undefined,
                    modifiers: (c.modifiers || []).map((m: any) => ({ optionId: m.optionId })),
                    isReward: c.isReward,
                    pointsCost: c.pointsCost
                })),
                rewards: cart.flatMap((c: any) => (c.rewards || []).map((r: any) => ({
                    rewardId: r.id,
                    pointsUsed: r.pointsCost
                }))),
                totalAmount: newItemsTotal,
                customerId: selectedCustomer?.id || undefined,
                tableId: selectedTable || undefined,
                orderType,
                paymentMethod: 'CASH', // Default since it's unpaid
                note,
                paidAmount: 0, // Explicitly unpaid park
                taxAmount: isExistingTableOrder ? 0 : financials.tax,
                serviceFeeAmount: isExistingTableOrder ? 0 : financials.serviceFeeAmount,
                discountAmount: isExistingTableOrder ? 0 : (financials.discount + financials.loyaltyCashback),
                scheduledAt: scheduledAt.toISOString(),
                isPreOrder: true,
                status: 'HELD' // Parks the order on the backend
            };

            await api.post('/orders/direct', payload);
            
            clearCart();
            setActiveOrderId(null);
            setNote?.('');
            setSelectedCustomer?.(null);
            setScheduledAt?.(null);
            
            await fetchParkedOrders?.();
        } catch (err: any) {
            console.error('Failed to park pre-order:', err);
            const message = err.response?.data?.message || err.message || 'Failed to park order';
            onError?.(message, err);
        } finally {
            setSubmitting(false);
        }
    }, [cart, financials, selectedCustomer, selectedTable, orderType, note, scheduledAt, activeOrderId, clearCart, fetchParkedOrders, setNote, setSelectedCustomer, setScheduledAt]);


    return {
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
    };
}
