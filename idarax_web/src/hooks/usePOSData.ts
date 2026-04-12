import { useState, useEffect } from 'react';
import { api, OfflineError } from '@/lib/api';
import { POSSettings } from '../types/pos';
import { hasFeature } from '@/utils/auth';

const CACHE_PRODUCTS = 'pos_cache_products';
const CACHE_CATEGORIES = 'pos_cache_categories';
const CACHE_SETTINGS = 'pos_cache_settings';

function saveToCache(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

function loadFromCache<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
}

export function usePOSData() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [menus, setMenus] = useState<any[]>([]);
    const [rewardCatalog, setRewardCatalog] = useState<any[]>([]);
    const [usingCache, setUsingCache] = useState(false);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState<POSSettings>({
        taxRate: 0,
        serviceFee: 0,
        currency: 'USD',
        logoUrl: '',
        receiptHeader: '',
        receiptFooter: '',
        receiptShowLogo: true,
        receiptShowTable: true,
        receiptShowCustomer: true,
        receiptShowOrderNumber: true,
        receiptFontSize: 12,
        receiptQrCodeUrl: '',
        loyaltyRatioEarning: 1.0,
        loyaltyRatioRedemption: 0.01,
        preOrderEnabled: false,
        preOrderMaxDaysAhead: 7,
        preOrderLeadMinutes: 30
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const branchId = typeof window !== 'undefined' ? document.cookie.match(/branch_id=([^;]+)/)?.[1] || '' : '';
            const [pRes, cRes, cuRes, sRes, tRes, mRes, rRes] = await Promise.all([
                api.get('/retail/products', { params: branchId ? { branchId } : {} }),
                api.get('/retail/categories'),
                hasFeature('CRM') ? api.get('/crm/customers').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
                api.get('/tenant/settings').catch(() => ({ data: {} })),
                // Always try to load tables — backend handles auth, no feature flag gate needed
                api.get('/restaurant/tables').catch(() => ({ data: [] })),
                api.get('/retail/menus/active', { params: branchId ? { branchId } : {} }),
                hasFeature('CRM') ? api.get('/crm/rewards').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
            ]);

            const productsData = Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || [];
            const categoriesData = Array.isArray(cRes.data) ? cRes.data : cRes.data?.data || [];
            const customersData = Array.isArray(cuRes.data) ? cuRes.data : cuRes.data?.data || [];
            const tablesData = Array.isArray(tRes.data) ? tRes.data : tRes.data?.data || [];
            // The /active endpoint already includes unscheduled (always-on) menus.
            // Do NOT fall back to all menus — that would defeat time-based scheduling.
            const menusData = Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || [];
            const rewardsData = Array.isArray(rRes.data) ? rRes.data : [];

            setProducts(productsData);
            setCategories(categoriesData);
            setCustomers(customersData);
            setTables(tablesData);
            setMenus(menusData);
            setRewardCatalog(rewardsData);

            const s = sRes.data;
            const settingsData: POSSettings = {
                taxRate: parseFloat(s.taxRate || '0'),
                serviceFee: parseFloat(s.serviceFee || '0'),
                currency: s.currency || 'USD',
                logoUrl: s.logoUrl || '',
                receiptHeader: s.receiptHeader || '',
                receiptFooter: s.receiptFooter || '',
                receiptShowLogo: s.receiptShowLogo ?? true,
                receiptShowTable: s.receiptShowTable ?? true,
                receiptShowCustomer: s.receiptShowCustomer ?? true,
                receiptShowOrderNumber: s.receiptShowOrderNumber ?? true,
                receiptFontSize: s.receiptFontSize || 12,
                receiptQrCodeUrl: s.receiptQrCodeUrl || '',
                loyaltyRatioEarning: parseFloat(s.loyaltyRatioEarning || '1.0'),
                loyaltyRatioRedemption: parseFloat(s.loyaltyRatioRedemption || '0.01'),
                receiptLanguage: s.receiptLanguage || 'en',
                receiptShowTimestamp: s.receiptShowTimestamp ?? true,
                receiptShowOrderType: s.receiptShowOrderType ?? true,
                receiptShowOperator: s.receiptShowOperator ?? true,
                receiptShowItemsDescription: s.receiptShowItemsDescription ?? true,
                receiptShowItemsQty: s.receiptShowItemsQty ?? true,
                receiptShowItemsPrice: s.receiptShowItemsPrice ?? true,
                receiptShowSubtotal: s.receiptShowSubtotal ?? true,
                receiptShowTax: s.receiptShowTax ?? true,
                receiptShowServiceCharge: s.receiptShowServiceCharge ?? true,
                receiptShowDiscount: s.receiptShowDiscount ?? true,
                receiptShowTotal: s.receiptShowTotal ?? true,
                receiptShowPaymentMethod: s.receiptShowPaymentMethod ?? true,
                receiptShowBarcode: s.receiptShowBarcode ?? true,
                preOrderEnabled: s.preOrderEnabled ?? false,
                preOrderMaxDaysAhead: s.preOrderMaxDaysAhead || 7,
                preOrderLeadMinutes: s.preOrderLeadMinutes || 30
            };
            setSettings(settingsData);

            saveToCache(CACHE_PRODUCTS, productsData);
            saveToCache(CACHE_CATEGORIES, categoriesData);
            saveToCache(CACHE_SETTINGS, settingsData);
            setUsingCache(false);
        } catch (error) {
            if (error instanceof OfflineError || !navigator.onLine) {
                const cachedProducts = loadFromCache<any[]>(CACHE_PRODUCTS, []);
                const cachedCategories = loadFromCache<any[]>(CACHE_CATEGORIES, []);
                const cachedSettings = loadFromCache<POSSettings>(CACHE_SETTINGS, settings);
                if (cachedProducts.length > 0) {
                    setProducts(cachedProducts);
                    setCategories(cachedCategories);
                    setSettings(cachedSettings);
                    setUsingCache(true);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const refetchTables = async () => {
        try {
            const tRes = await api.get('/restaurant/tables');
            setTables(tRes.data?.data || tRes.data || []);
        } catch (err) {}
    };

    const refetchCustomers = async () => {
        try {
            const cuRes = await api.get('/crm/customers');
            setCustomers(Array.isArray(cuRes.data) ? cuRes.data : cuRes.data?.data || []);
        } catch (err) {}
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        products,
        categories,
        customers,
        tables,
        menus,
        rewardCatalog,
        settings,
        usingCache,
        loading,
        setCustomers,
        setRewardCatalog,
        refetchTables,
        refetchCustomers,
        refreshData: fetchData
    };
}
