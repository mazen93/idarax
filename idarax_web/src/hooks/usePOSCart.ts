import { useState, useEffect } from 'react';
import { CartItem, OrderType, POSSettings, OfferDetails } from '../types/pos';
import { api } from '@/lib/api';
import { playSuccessBeep } from '@/utils/audio';

export function usePOSCart(settings: POSSettings, orderType: OrderType, selectedTable: string, selectedCustomer: any) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [offerCodeInput, setOfferCodeInput] = useState('');
    const [appliedOffer, setAppliedOffer] = useState<OfferDetails | null>(null);
    const [offerError, setOfferError] = useState('');
    const [redeemAsCashback, setRedeemAsCashback] = useState(false);
    const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState<number>(0);
    const [autoPromos, setAutoPromos] = useState<any[]>([]);
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    const addToCart = (product: any, variant?: any, selectedModifiers: any[] = []) => {
        const modifierPrice = selectedModifiers.reduce((sum, m) => sum + parseFloat(m.priceAdjust || 0), 0);
        const basePrice = parseFloat(variant?.price ?? product.price) || 0;
        const price = basePrice + modifierPrice;

        const modifierKey = selectedModifiers.map(m => m.id).sort().join(',');

        playSuccessBeep();

        setCart(prev => {
            const existing = prev.find(c =>
                !c.isSaved &&
                c.productId === product.id &&
                c.variantId === variant?.id &&
                (c.modifiers?.map(m => m.optionId).sort().join(',') === modifierKey)
            );

            let newCart;
            let currentId;

            if (existing) {
                currentId = existing.cartId;
                // Smart Stacking: Move to end of list for visibility
                const otherItems = prev.filter(c => c.cartId !== existing.cartId);
                newCart = [...otherItems, { ...existing, quantity: existing.quantity + 1 }];
            } else {
                currentId = crypto.randomUUID();
                const newItem: CartItem = {
                    cartId: currentId,
                    productId: product.id,
                    name: product.name,
                    nameAr: product.nameAr,
                    price,
                    quantity: 1,
                    variantName: variant?.name,
                    variantNameAr: variant?.nameAr,
                    variantId: variant?.id,
                    modifiers: selectedModifiers.map(m => ({ optionId: m.id, name: m.name, nameAr: m.nameAr, price: parseFloat(m.priceAdjust || 0) })),
                    isSaved: false
                };
                newCart = [...prev, newItem];
            }

            setLastAddedId(currentId);
            setTimeout(() => setLastAddedId(null), 1500);
            return newCart;
        });
    };

    const updateQty = (cartId: string, delta: number) => {
        setCart(prev => prev.map(c => c.cartId === cartId ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0 || c.isSaved));
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(c => c.cartId !== cartId));
    };

    const updateItemNote = (cartId: string, note: string) => {
        setCart(prev => prev.map(c => c.cartId === cartId ? { ...c, note } : c));
    };

    const updateItemCourse = (cartId: string, courseName: string) => {
        setCart(prev => prev.map(c => c.cartId === cartId ? { ...c, courseName: c.courseName === courseName ? undefined : courseName } : c));
    };

    const updateItemPrice = (cartId: string, newPrice: number | undefined) => {
        setCart(prev => prev.map(c => c.cartId === cartId ? { ...c, overridePrice: newPrice } : c));
    };

    const clearCart = () => {
        setCart([]);
        setOfferCodeInput('');
        setAppliedOffer(null);
        setOfferError('');
        setRedeemAsCashback(false);
        setLoyaltyPointsToRedeem(0);
    };

    const [isApplyingOffer, setIsApplyingOffer] = useState(false);
    const [upsells, setUpsells] = useState<any[]>([]);

    const applyOffer = async (code: string) => {
        setIsApplyingOffer(true);
        try {
            const res = await api.post('/offers/validate', {
                code,
                items: cart.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.overridePrice ?? item.price
                }))
            });
            if (res.data.isValid) {
                setAppliedOffer({
                    code,
                    type: res.data.type,
                    value: res.data.discountAmount,
                    minOrderAmount: res.data.minOrderAmount
                });
                return true;
            }
            return false;
        } catch (err) {
            return false;
        } finally {
            setIsApplyingOffer(false);
        }
    };

    const removeOffer = () => setAppliedOffer(null);

    // Derived Values
    const subtotal = cart.reduce((sum, item) => sum + ((item.overridePrice ?? item.price) * item.quantity), 0);
    const serviceFeeAmount = (orderType === OrderType.DINE_IN && selectedTable) ? Number(settings?.serviceFee || 0) : 0;
    const tax = (subtotal + serviceFeeAmount) * (Number(settings?.taxRate || 0) / 100);
    const discount = appliedOffer ? appliedOffer.value : 0;
    const loyaltyCashback = redeemAsCashback ? (loyaltyPointsToRedeem * (settings?.loyaltyRatioRedemption || 0.01)) : 0;
    const total = Math.max(0, (subtotal + serviceFeeAmount + tax - discount - loyaltyCashback) || 0);

    const financials = {
        subtotal,
        tax,
        discount,
        serviceFeeAmount,
        loyaltyCashback,
        total
    };

    // AI Upsells (Enterprise Feature)
    useEffect(() => {
        if (cart.length === 0) { setUpsells([]); return; }
        
        // Get all unique product IDs in the cart
        const productIds = Array.from(new Set(cart.map(c => c.productId))).join(',');
        
        // Use the correct AI analytics endpoint and send all cart items for better context
        api.get(`/analytics/ai/upsell?productIds=${productIds}`)
            .then(res => setUpsells(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
            .catch(() => setUpsells([]));
    }, [cart.map(c => c.productId).join(',')]);

    // Offer Revalidation
    useEffect(() => {
        const revalidateOffer = async () => {
            if (!appliedOffer || appliedOffer.type !== 'DYNAMIC') return;
            try {
                const res = await api.post('/offers/validate', {
                    code: appliedOffer.code,
                    items: cart.map(c => ({
                        productId: c.productId,
                        variantId: c.variantId || undefined,
                        quantity: c.quantity,
                        price: c.overridePrice ?? c.price
                    }))
                });
                if (res.data.isValid && res.data.discountAmount !== appliedOffer.value) {
                    setAppliedOffer(prev => prev ? { ...prev, value: res.data.discountAmount, maxDiscountAmount: res.data.discountAmount } : null);
                } else if (!res.data.isValid) {
                    setAppliedOffer(null);
                }
            } catch (err) {
                setAppliedOffer(null);
            }
        };
        revalidateOffer();
    }, [cart, appliedOffer?.code]);

    // Auto Promotions
    useEffect(() => {
        if (cart.length === 0) { setAutoPromos([]); return; }
        const items = cart.map(c => ({
            productId: c.variantId ? c.productId.split('-')[0] : c.productId,
            quantity: c.quantity,
            price: c.overridePrice ?? c.price
        }));
        api.post('/offers/auto-promotions', { items, customerId: selectedCustomer?.id })
            .then(res => setAutoPromos(res.data))
            .catch(() => setAutoPromos([]));
    }, [cart, selectedCustomer?.id]);

    return {
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
        offerCodeInput,
        setOfferCodeInput,
        appliedOffer,
        setAppliedOffer,
        applyOffer,
        removeOffer,
        isApplyingOffer,
        offerError,
        setOfferError,
        redeemAsCashback,
        setRedeemAsCashback,
        loyaltyPointsToRedeem,
        setLoyaltyPointsToRedeem,
        autoPromos,
        upsells
    };
}
