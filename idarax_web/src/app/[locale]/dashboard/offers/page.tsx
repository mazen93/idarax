'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, Package, ArrowUpRight, ArrowDownRight, Clock, DollarSign, ListOrdered, AlertTriangle, ChevronRight, Activity, Trash2, Plus, Gift, CheckCircle2, AlertCircle, Settings2, Star, Percent, Tag, Layers, UserCheck, X, Ticket, BadgeDollarSign, HeartHandshake, MousePointerClick, BadgePercent, Search } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const PROMOTION_TYPES = [
    { id: 'PERCENTAGE_OFF', label: 'Percentage Off', icon: Percent, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { id: 'FIXED_AMOUNT_OFF', label: 'Fixed Amount Off', icon: BadgeDollarSign, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'BOGO', label: 'Buy 1 Get 1 (BOGO)', icon: HeartHandshake, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'BUY_X_GET_Y_FREE', label: 'Buy X Get Y Free', icon: Plus, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { id: 'BUY_X_GET_Y_PERCENT_OFF', label: 'Buy X Get Y % Off', icon: MousePointerClick, color: 'text-error-400', bg: 'bg-error-500/10' },
    { id: 'FREE_ITEM', label: 'Free Item', icon: Gift, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: 'TIER_DISCOUNT', label: 'Tier Volume Discount', icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
    { id: 'STAFF_VOUCHER', label: 'Staff Voucher', icon: BadgePercent, color: 'text-warning-400', bg: 'bg-warning-500/10' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CUSTOMER_SEGMENTS = ['ALL', 'NEW', 'RETURNING', 'VIP'];

const defaultPromoForm = {
    name: '',
    description: '',
    type: 'PERCENTAGE_OFF',
    buyQuantity: 1,
    getQuantity: 1,
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    isActive: true,
    applicableProductIds: [] as string[],
    // Phase 2
    freeItemProductId: '',
    tierThresholds: [{ minQty: 5, pct: 10 }] as { minQty: number; pct: number }[],
    // Phase 3
    happyHourDays: [] as number[],
    happyHourStart: '',
    happyHourEnd: '',
    customerSegment: 'ALL',
    isBirthdayBonus: false,
};

const defaultCodeForm = {
    code: '',
    promotionId: '',
    maxUsages: '',
    maxUsagesPerCustomer: '',
    firstOrderOnly: false,
    isStackable: false,
    staffOnly: false,
};

export default function PromotionsPage() {
    const { showAlert, showConfirm } = useModal();
    const { t, isRTL } = useLanguage();
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'promotions' | 'codes' | 'analytics'>('promotions');
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

    const [promoForm, setPromoForm] = useState({ ...defaultPromoForm });
    const [codeForm, setCodeForm] = useState({ ...defaultCodeForm });

    const handleEditPromotion = (promo: any) => {
        setEditingPromoId(promo.id);
        setPromoForm({
            name: promo.name || '',
            description: promo.description || '',
            type: promo.type,
            buyQuantity: promo.buyQuantity || 1,
            getQuantity: promo.getQuantity || 1,
            discountValue: promo.discountValue !== null && promo.discountValue !== undefined ? String(promo.discountValue) : '',
            minOrderAmount: promo.minOrderAmount !== null && promo.minOrderAmount !== undefined ? String(promo.minOrderAmount) : '',
            maxDiscountAmount: promo.maxDiscountAmount !== null && promo.maxDiscountAmount !== undefined ? String(promo.maxDiscountAmount) : '',
            isActive: promo.isActive !== false,
            applicableProductIds: promo.applicableProductIds || [],
            freeItemProductId: promo.freeItemProductId || '',
            tierThresholds: promo.tierThresholds || [{ minQty: 5, pct: 10 }],
            happyHourDays: promo.happyHourDays || [],
            happyHourStart: promo.happyHourStart || '',
            happyHourEnd: promo.happyHourEnd || '',
            customerSegment: promo.customerSegment || 'ALL',
            isBirthdayBonus: !!promo.isBirthdayBonus,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const [products, setProducts] = useState<any[]>([]);
    const [showProductSelector, setShowProductSelector] = useState(false);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const [promoRes, prodRes, analyticsRes] = await Promise.all([
                fetchWithAuth(`/offers/promotions`),
                fetchWithAuth(`/retail/products`),
                fetchWithAuth(`/offers/analytics`)
            ]);
            if (promoRes.ok) {
                const result = await promoRes.json();
                const d = (result && result.data !== undefined) ? result.data : result;
                setPromotions(Array.isArray(d) ? d : []);
            }
            if (prodRes.ok) {
                const result = await prodRes.json();
                const d = (result && result.data !== undefined) ? result.data : result;
                setProducts(Array.isArray(d) ? d : []);
            }
            if (analyticsRes.ok) {
                const result = await analyticsRes.json();
                const d = (result && result.data !== undefined) ? result.data : result;
                setAnalytics(Array.isArray(d) ? d : []);
            }
        } catch (err) { console.error('Error fetching data:', err); }
        setLoading(false);
    };

    useEffect(() => { fetchPromotions(); }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if ((e.target as Element).closest?.('.product-selector-dd')) return;
            setShowProductSelector(false);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleCreatePromotion = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            ...promoForm,
            discountValue: promoForm.discountValue ? parseFloat(promoForm.discountValue) : undefined,
            minOrderAmount: promoForm.minOrderAmount ? parseFloat(promoForm.minOrderAmount) : undefined,
            maxDiscountAmount: promoForm.maxDiscountAmount ? parseFloat(promoForm.maxDiscountAmount) : undefined,
            buyQuantity: parseInt(String(promoForm.buyQuantity)),
            getQuantity: parseInt(String(promoForm.getQuantity)),
            freeItemProductId: promoForm.freeItemProductId || undefined,
            tierThresholds: promoForm.type === 'TIER_DISCOUNT' ? promoForm.tierThresholds : undefined,
            happyHourDays: promoForm.happyHourDays,
            happyHourStart: promoForm.happyHourStart || undefined,
            happyHourEnd: promoForm.happyHourEnd || undefined,
            customerSegment: promoForm.customerSegment !== 'ALL' ? promoForm.customerSegment : undefined,
        };

        try {
            const endpoint = editingPromoId ? `/offers/promotions/${editingPromoId}` : `/offers/promotions`;
            const method = editingPromoId ? 'PATCH' : 'POST';
            const res = await fetchWithAuth(endpoint, { method, body: JSON.stringify(payload) });
            if (res.ok) {
                setShowForm(false);
                setEditingPromoId(null);
                fetchPromotions();
                setPromoForm({ ...defaultPromoForm });
            } else {
                const err = await res.json();
                showAlert({ title: 'Error', message: err?.message || 'Failed to save promotion', variant: 'DANGER' });
            }
        } catch (err) { }
    };

    const handleDeletePromotion = async (id: string) => {
        showConfirm({
            title: 'Delete Promotion',
            message: 'Are you sure you want to delete this promotion? This might break existing codes.',
            variant: 'DANGER',
            onConfirm: async () => {
                try {
                    const res = await fetchWithAuth(`/offers/promotions/${id}`, { method: 'DELETE' });
                    if (res.ok) fetchPromotions();
                } catch (err) { console.error(err); }
            }
        });
    };

    const handleCreateCode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetchWithAuth(`/offers/promo-codes`, {
                method: 'POST',
                body: JSON.stringify({
                    ...codeForm,
                    maxUsages: codeForm.maxUsages ? parseInt(codeForm.maxUsages) : undefined,
                    maxUsagesPerCustomer: codeForm.maxUsagesPerCustomer ? parseInt(codeForm.maxUsagesPerCustomer) : undefined,
                })
            });
            if (res.ok) {
                fetchPromotions();
                setCodeForm({ ...defaultCodeForm });
            }
        } catch (err) { }
    };

    const handleDeleteCode = async (id: string) => {
        showConfirm({
            title: 'Delete Promo Code',
            message: 'Are you sure you want to delete this promo code?',
            variant: 'DANGER',
            onConfirm: async () => {
                try {
                    const res = await fetchWithAuth(`/offers/promo-codes/${id}`, { method: 'DELETE' });
                    if (res.ok) fetchPromotions();
                } catch (err) { console.error(err); }
            }
        });
    };

    const toggleHappyHourDay = (day: number) => {
        setPromoForm(prev => ({
            ...prev,
            happyHourDays: prev.happyHourDays.includes(day)
                ? prev.happyHourDays.filter(d => d !== day)
                : [...prev.happyHourDays, day]
        }));
    };

    const renderRuleDescription = (promo: any) => {
        if (!promo) return '';
        switch (promo.type) {
            case 'BOGO': return 'Pay 1, Get 2 items';
            case 'BUY_X_GET_Y_FREE': return `Buy ${promo.buyQuantity || 0}, Get ${promo.getQuantity || 0} Free`;
            case 'PERCENTAGE_OFF': return `${promo.discountValue || 0}% Off Total`;
            case 'FIXED_AMOUNT_OFF': return `$${promo.discountValue || 0} Off Total`;
            case 'BUY_X_GET_Y_PERCENT_OFF': return `Buy ${promo.buyQuantity || 0}, get ${promo.getQuantity || 0} at ${promo.discountValue || 0}% off`;
            case 'FREE_ITEM': return `Free item attached to order`;
            case 'TIER_DISCOUNT': return `Volume tiers: ${Array.isArray(promo.tierThresholds) ? promo.tierThresholds.map((t: any) => `${t?.minQty}+ items → ${t?.pct}% off`).join(', ') : 'See config'}`;
            case 'STAFF_VOUCHER': return `Staff ${promo.discountValue || 0}% discount`;
            default: return promo.type || 'Unknown';
        }
    };

    return (
        <div className={`min-h-screen text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4`}>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2 flex items-center gap-3">
                        <Tag className="w-8 h-8 text-primary" /> {t('promotions_title')}
                    </h1>
                    <p className="text-muted-foreground text-lg">{t('promotions_subtitle')}</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) {
                            setEditingPromoId(null);
                            setPromoForm({ ...defaultPromoForm });
                        }
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-success-900/20 active:scale-95"
                >
                    {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    {showForm ? 'Close Designer' : editingPromoId ? 'Continue Editing' : 'New Promotion'}
                </button>
            </div>

            {showForm && (
                <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary" /> Rule Designer
                        </h2>
                        <form onSubmit={handleCreatePromotion} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground ml-1">Promotion Name</label>
                                    <input required placeholder="e.g. Summer BOGO Special" value={promoForm.name} onChange={e => setPromoForm({ ...promoForm, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground ml-1">Strategy Type</label>
                                    <select value={promoForm.type} onChange={e => setPromoForm({ ...promoForm, type: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors appearance-none">
                                        {PROMOTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                </div>

                                {/* Buy/Get fields for BOGO types */}
                                {(promoForm.type === 'BOGO' || promoForm.type === 'BUY_X_GET_Y_FREE' || promoForm.type === 'BUY_X_GET_Y_PERCENT_OFF') && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-muted-foreground ml-1">Buy Quantity (X)</label>
                                            <input type="number" min="1" value={promoForm.buyQuantity} onChange={e => setPromoForm({ ...promoForm, buyQuantity: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-muted-foreground ml-1">Get Quantity (Y)</label>
                                            <input type="number" min="1" value={promoForm.getQuantity} onChange={e => setPromoForm({ ...promoForm, getQuantity: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors" />
                                        </div>
                                    </>
                                )}

                                {/* Discount value for applicable types */}
                                {(promoForm.type !== 'BOGO' && promoForm.type !== 'BUY_X_GET_Y_FREE' && promoForm.type !== 'FREE_ITEM' && promoForm.type !== 'TIER_DISCOUNT') && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground ml-1">
                                            {promoForm.type.includes('PERCENT') || promoForm.type === 'PERCENTAGE_OFF' || promoForm.type === 'STAFF_VOUCHER' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
                                        </label>
                                        <input required type="number" step="0.01" value={promoForm.discountValue} onChange={e => setPromoForm({ ...promoForm, discountValue: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors" />
                                    </div>
                                )}

                                {/* FREE_ITEM: pick the free product */}
                                {promoForm.type === 'FREE_ITEM' && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2"><Gift className="w-4 h-4 text-pink-400" /> Free Item Product</label>
                                        <select value={promoForm.freeItemProductId} onChange={e => setPromoForm({ ...promoForm, freeItemProductId: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary appearance-none">
                                            {Array.isArray(products) && (products as any[]).filter(p => p && p.id).map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* TIER_DISCOUNT: threshold config */}
                                {promoForm.type === 'TIER_DISCOUNT' && (
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Volume Tiers</label>
                                        {(Array.isArray(promoForm.tierThresholds) ? promoForm.tierThresholds : []).map((tier, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
                                                <span className="text-xs text-muted-foreground w-14">Tier {idx + 1}</span>
                                                <input type="number" min="1" placeholder="Min Qty" value={tier.minQty} onChange={e => {
                                                    const updated = [...promoForm.tierThresholds];
                                                    updated[idx] = { ...updated[idx], minQty: parseInt(e.target.value) || 1 };
                                                    setPromoForm({ ...promoForm, tierThresholds: updated });
                                                }} className="flex-1 bg-card border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary" />
                                                <span className="text-muted-foreground text-sm">items →</span>
                                                <input type="number" min="1" max="100" placeholder="%" value={tier.pct} onChange={e => {
                                                    const updated = [...promoForm.tierThresholds];
                                                    updated[idx] = { ...updated[idx], pct: parseInt(e.target.value) || 0 };
                                                    setPromoForm({ ...promoForm, tierThresholds: updated });
                                                }} className="flex-1 bg-card border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary" />
                                                <span className="text-muted-foreground text-sm">% off</span>
                                                {promoForm.tierThresholds.length > 1 && (
                                                    <button type="button" onClick={() => setPromoForm({ ...promoForm, tierThresholds: promoForm.tierThresholds.filter((_, i) => i !== idx) })} className="text-slate-600 hover:text-error-400">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => setPromoForm({ ...promoForm, tierThresholds: [...promoForm.tierThresholds, { minQty: 10, pct: 15 }] })} className="text-xs text-primary hover:text-primary-300 flex items-center gap-1 mt-1">
                                            <Plus className="w-3 h-3" /> Add Tier
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground ml-1">Min Order Amount ($)</label>
                                    <input type="number" step="0.01" placeholder="Optional" value={promoForm.minOrderAmount} onChange={e => setPromoForm({ ...promoForm, minOrderAmount: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors" />
                                </div>

                                {/* Customer Segment */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2"><Users className="w-3.5 h-3.5 text-muted-foreground" /> Target Segment</label>
                                    <select value={promoForm.customerSegment} onChange={e => setPromoForm({ ...promoForm, customerSegment: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary appearance-none">
                                        {CUSTOMER_SEGMENTS.map(s => <option key={s} value={s}>{s} Customers</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Happy Hour Section */}
                            <div className="bg-background/50 border border-border rounded-xl p-5 space-y-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                    <Clock className="w-4 h-4 text-warning-400" /> Happy Hour Window (Optional)
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {DAYS_OF_WEEK.map((day, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => toggleHappyHourDay(idx)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${promoForm.happyHourDays.includes(idx) ? 'bg-warning-500 text-black' : 'bg-muted text-muted-foreground hover:bg-muted-foreground'}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                                {promoForm.happyHourDays.length > 0 && (
                                    <div className="flex gap-4">
                                        <div className="space-y-1 flex-1">
                                            <label className="text-xs text-muted-foreground">From</label>
                                            <input type="time" value={promoForm.happyHourStart} onChange={e => setPromoForm({ ...promoForm, happyHourStart: e.target.value })} className="w-full bg-card border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-warning-500" />
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <label className="text-xs text-muted-foreground">To</label>
                                            <input type="time" value={promoForm.happyHourEnd} onChange={e => setPromoForm({ ...promoForm, happyHourEnd: e.target.value })} className="w-full bg-card border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-warning-500" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Flags */}
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={promoForm.isBirthdayBonus} onChange={e => setPromoForm({ ...promoForm, isBirthdayBonus: e.target.checked })} className="w-4 h-4 rounded text-primary focus:ring-success-500 bg-background border-slate-700" />
                                    <span className="text-sm text-slate-300 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-warning-400" /> Birthday Bonus</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={promoForm.isActive} onChange={e => setPromoForm({ ...promoForm, isActive: e.target.checked })} className="w-4 h-4 rounded text-primary focus:ring-success-500 bg-background border-slate-700" />
                                    <span className="text-sm text-slate-300">Active</span>
                                </label>
                            </div>

                            {/* Product Selector */}
                            <div className="space-y-2 relative product-selector-dd">
                                <label className="text-sm font-semibold text-muted-foreground ml-1">Applicable Products (Optional)</label>
                                <div onClick={() => setShowProductSelector(!showProductSelector)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-slate-300 cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-center">
                                    <span>{promoForm.applicableProductIds.length === 0 ? 'Applies to entire order' : `${promoForm.applicableProductIds.length} product(s) selected`}</span>
                                    <Search className="w-4 h-4 text-muted-foreground" />
                                </div>
                                {showProductSelector && (
                                    <div className="absolute z-50 left-0 right-0 mt-2 bg-card border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2 grid gap-1">
                                        <label className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                                            <input type="checkbox" checked={promoForm.applicableProductIds.length === 0} onChange={() => setPromoForm({ ...promoForm, applicableProductIds: [] })} className="w-4 h-4 rounded text-primary bg-background border-slate-700" />
                                            <span className="text-sm font-bold text-white">All Products</span>
                                        </label>
                                        <div className="h-px bg-muted my-1 mx-2" />
                                        {Array.isArray(products) && products.filter(p => p).map(p => (
                                            <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                                                <input type="checkbox" checked={promoForm.applicableProductIds.includes(p.id)} onChange={(e) => {
                                                    setPromoForm(prev => ({
                                                        ...prev,
                                                        applicableProductIds: e.target.checked ? [...prev.applicableProductIds, p.id] : prev.applicableProductIds.filter(id => id !== p.id)
                                                    }));
                                                }} className="w-4 h-4 rounded text-primary bg-background border-slate-700" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-white">{p.name}</span>
                                                    {p.category?.name && <span className="text-[10px] text-muted-foreground uppercase">{p.category.name}</span>}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <textarea placeholder="Description / Terms & Conditions" rows={2} value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-colors resize-none" />

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="submit" className="px-8 py-3 bg-primary hover:bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-success-900/20">
                                    {editingPromoId ? 'Update Promotion' : 'Activate Promotion Rule'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* PromoCode Form */}
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-primary" /> Generate Promo Code
                        </h2>
                        <p className="text-xs text-muted-foreground mb-6">Link a keyword to an active strategy with advanced limits.</p>

                        <form onSubmit={handleCreateCode} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground ml-1">Keyword / Code</label>
                                <input required placeholder="e.g. WELCOME50" value={codeForm.code} onChange={e => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-mono tracking-widest outline-none focus:border-primary transition-colors" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground ml-1">Target Strategy</label>
                                <select required value={codeForm.promotionId} onChange={e => setCodeForm({ ...codeForm, promotionId: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary appearance-none text-sm">
                                    <option value="" disabled>Select active rule...</option>
                                    {Array.isArray(promotions) && promotions.filter(p => p && p.isActive).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground ml-1">Global Limit</label>
                                    <input type="number" placeholder="∞" value={codeForm.maxUsages} onChange={e => setCodeForm({ ...codeForm, maxUsages: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground ml-1">Per Customer Limit</label>
                                    <input type="number" placeholder="∞" value={codeForm.maxUsagesPerCustomer} onChange={e => setCodeForm({ ...codeForm, maxUsagesPerCustomer: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary" />
                                </div>
                            </div>

                            {/* Flags */}
                            <div className="space-y-2 bg-background/50 border border-border rounded-xl p-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Code Restrictions</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={codeForm.firstOrderOnly} onChange={e => setCodeForm({ ...codeForm, firstOrderOnly: e.target.checked })} className="w-4 h-4 rounded text-primary bg-background border-slate-700" />
                                    <span className="text-sm text-slate-300">First Order Only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={codeForm.isStackable} onChange={e => setCodeForm({ ...codeForm, isStackable: e.target.checked })} className="w-4 h-4 rounded text-primary bg-background border-slate-700" />
                                    <span className="text-sm text-slate-300">Stackable with other codes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={codeForm.staffOnly} onChange={e => setCodeForm({ ...codeForm, staffOnly: e.target.checked })} className="w-4 h-4 rounded text-primary bg-background border-slate-700" />
                                    <span className="text-sm text-slate-300">Staff Only</span>
                                </label>
                            </div>

                            <button type="submit" disabled={!codeForm.promotionId} className="w-full py-4 bg-primary hover:bg-primary disabled:bg-muted disabled:text-slate-600 text-white rounded-xl font-bold transition-all mt-2 shadow-lg shadow-primary-900/20">
                                Create Promo Code
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* List Section */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="flex border-b border-border overflow-x-auto custom-scrollbar">
                    <button onClick={() => setActiveTab('promotions')} className={`whitespace-nowrap px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'promotions' ? 'text-primary' : 'text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        {t('active_strategies')}
                        {activeTab === 'promotions' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                    </button>
                    <button onClick={() => setActiveTab('codes')} className={`whitespace-nowrap px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'codes' ? 'text-primary' : 'text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        {t('keyword_directory')}
                        {activeTab === 'codes' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'analytics' ? 'text-warning-500' : 'text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        {t('usage_analytics')}
                        {activeTab === 'analytics' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-warning-500" />}
                    </button>
                </div>

                <div className="p-0">
                    {loading && <div className="py-20 text-center animate-pulse text-muted-foreground font-medium">Synchronizing engine status...</div>}

                    {!loading && activeTab === 'promotions' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-card/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('promotion_details') || 'Promotion Details'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('rule_logic') || 'Rule Logic'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('constraints') || 'Constraints'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('codes') || 'Codes'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('status') || 'Status'}</th>
                                        <th className="px-6 py-4" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                     {(() => {
                                        const promotionList = Array.isArray(promotions) ? promotions : [];
                                        const filtered = promotionList.filter(p => p && typeof p === 'object');
                                        if (filtered.length === 0) {
                                            return <tr><td colSpan={6} className="py-20 text-center text-muted-foreground text-sm italic">No promotion strategies configured yet. Click &quot;New Promotion&quot; to begin.</td></tr>;
                                        }
                                        return filtered.map(promo => {
                                            const typeInfo = PROMOTION_TYPES.find(t => t.id === promo.type) || PROMOTION_TYPES[0];
                                            const TypeIcon = typeInfo.icon;
                                            return (
                                                <tr key={promo.id} className="hover:bg-muted/30 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${typeInfo.bg} ${typeInfo.color}`}>
                                                                <TypeIcon className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white group-hover:text-primary transition-colors">{promo.name}</div>
                                                                <div className="text-xs text-muted-foreground line-clamp-1">{promo.description || 'No description'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="text-sm font-medium text-slate-300">{renderRuleDescription(promo)}</div>
                                                        {promo.minOrderAmount > 0 && <div className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Min ${promo.minOrderAmount}</div>}
                                                    </td>
                                                    <td className="px-6 py-5 text-xs text-muted-foreground space-y-1">
                                                        {promo.happyHourDays?.length > 0 && (
                                                            <div className="flex items-center gap-1 text-warning-400">
                                                                <Clock className="w-3 h-3" />
                                                                {Array.isArray(promo.happyHourDays) && promo.happyHourDays.map((d: number) => DAYS_OF_WEEK[d]).join(',')} {promo.happyHourStart}–{promo.happyHourEnd}
                                                            </div>
                                                        )}
                                                        {promo.customerSegment && promo.customerSegment !== 'ALL' && (
                                                            <div className="flex items-center gap-1 text-purple-400">
                                                                <Users className="w-3 h-3" /> {promo.customerSegment}
                                                            </div>
                                                        )}
                                                        {promo.isBirthdayBonus && <div className="flex items-center gap-1 text-warning-400"><Star className="w-3 h-3" /> Birthday</div>}
                                                        {(!Array.isArray(promo.happyHourDays) || !promo.happyHourDays.length) && !promo.customerSegment && !promo.isBirthdayBonus && <span className="text-slate-700">—</span>}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex -space-x-2">
                                                            {Array.isArray(promo.promoCodes) && promo.promoCodes.map((c: any) => (
                                                                <div key={c.id} title={c.code} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-primary flex items-center justify-center text-[10px] font-black text-white cursor-help">
                                                                    {c.code[0]}
                                                                </div>
                                                            ))}
                                                            {(!Array.isArray(promo.promoCodes) || promo.promoCodes.length === 0) && <span className="text-xs text-slate-600 italic">None</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {promo.isActive ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                                                                <CheckCircle2 className="w-3 h-3" /> Live
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-muted text-muted-foreground border border-slate-700">
                                                                <AlertCircle className="w-3 h-3" /> Paused
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5 text-right flex gap-1 justify-end">
                                                        <button onClick={() => handleEditPromotion(promo)} className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10">
                                                            <Settings2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeletePromotion(promo.id)} className="p-2 text-muted-foreground hover:text-error-400 transition-colors rounded-lg hover:bg-error-500/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                    {/* Promotions will be rendered above */}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && activeTab === 'codes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                            {(() => {
                                const promotionList = Array.isArray(promotions) ? promotions : [];
                                const allCodes = promotionList.filter(p => p && p.promoCodes).flatMap(p => Array.isArray(p.promoCodes) ? p.promoCodes.filter((c: any) => c && c.id) : []);
                                if (allCodes.length === 0) {
                                    return <div className="col-span-3 py-20 text-center text-muted-foreground text-sm italic">No promo codes created yet.</div>;
                                }
                                return allCodes.map((code: any) => (
                                <div key={code.id} className="bg-background/50 border border-border p-6 rounded-2xl group hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-2xl font-black text-white tracking-widest font-mono group-hover:text-primary transition-colors uppercase">{code?.code || 'NOCODE'}</div>
                                        <button onClick={() => handleDeleteCode(code.id)} className="text-slate-600 hover:text-error-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-bold border-l-2 border-primary pl-3 py-1 mb-4">
                                        {PROMOTION_TYPES.find(t => t.id === code.promotion?.type)?.label || 'GENERIC'}
                                    </div>
                                    {/* Flags badges */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {code.firstOrderOnly && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-primary-500/10 text-primary-300 border border-primary-500/20">1st Order</span>}
                                        {code.staffOnly && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-warning-500/10 text-warning-300 border border-warning-500/20">Staff Only</span>}
                                        {code.isStackable && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">Stackable</span>}
                                        {code.maxUsagesPerCustomer && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-muted-foreground text-slate-300">{code.maxUsagesPerCustomer}x/customer</span>}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-xs text-muted-foreground">
                                            Usage: <span className="text-white font-bold">{code.usedCount}</span> / <span className="text-slate-600">{code.maxUsages || '∞'}</span>
                                        </div>
                                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: code.maxUsages ? `${(code.usedCount / code.maxUsages) * 100}%` : '0%' }} />
                                        </div>
                                    </div>
                                </div>
                                ));
                            })()}
                            {/* Codes will be rendered above */}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-card/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('code') || 'Code'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('promotion_linked') || 'Promotion Linked'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">{t('usages') || 'Usages'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">{t('revenue') || 'Revenue'}</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('status') || 'Status'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {(!Array.isArray(analytics) || analytics.length === 0) ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-muted-foreground text-sm italic">No analytics data yet.</td></tr>
                                    ) : (analytics as any[]).filter((s: any) => s).map((stat: any) => (
                                        <tr key={stat.id || Math.random()} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-5 font-mono font-bold text-warning-400 tracking-wider uppercase">{stat.code || '—'}</td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm text-white font-medium">{stat?.promotionName || 'Unknown Promotion'}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{PROMOTION_TYPES.find(t => t.id === stat?.promotionType)?.label || 'Strategy'}</div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className="text-white font-bold">{stat.usedCount || 0}</span>
                                                <span className="text-xs text-muted-foreground ml-1">/ {stat.maxUsages || '∞'}</span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-medium text-primary">
                                                ${parseFloat(String(stat?.totalRevenueGenerated || 0)).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-5">
                                                {stat.status === 'Active' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary">Active</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-muted text-muted-foreground">Inactive</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Analytics will be rendered above */}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
