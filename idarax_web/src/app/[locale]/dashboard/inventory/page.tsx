'use client';

import { useState, useEffect } from 'react';
import { Package, MapPin, ArrowRightLeft, Building2, Plus, Search, Trash2, CheckCircle2, XCircle, ShoppingBag, TrendingUp, Clock, ArrowRight, Pencil, GitBranch, Filter, AlertTriangle, GanttChartSquare, X, Zap } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const STATUS_BADGES: Record<string, { color: string; icon: React.ComponentType<any>; label: string }> = {
    PENDING: { color: 'text-warning-400 bg-warning-500/10 border-warning-500/20', icon: Clock, label: 'Pending' },
    COMPLETED: { color: 'text-primary bg-primary/10 border-primary/20', icon: CheckCircle2, label: 'Completed' },
    CANCELLED: { color: 'text-error-400 bg-error-500/10 border-error-500/20', icon: XCircle, label: 'Cancelled' },
};

export default function InventoryPage() {
    const { showAlert, showConfirm } = useModal();
    const { t, isRTL, formatCurrency } = useLanguage();
    const [tab, setTab] = useState<'stock' | 'warehouses' | 'transfers' | 'vendors' | 'purchase-orders' | 'adjustments' | 'analytics' | 'history' | 'stocktake' | 'ai-predictions'>('stock');

    // Stock
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [adjustForm, setAdjustForm] = useState({ warehouseId: '', quantity: '', type: 'ADD', reason: '' });

    // Warehouses
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [showWarehouseForm, setShowWarehouseForm] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
    const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '' });

    // Transfers
    const [transfers, setTransfers] = useState<any[]>([]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferForm, setTransferForm] = useState({ sourceId: '', destinationId: '', productId: '', quantity: '1' });

    // Vendors
    const [vendors, setVendors] = useState<any[]>([]);
    const [showVendorForm, setShowVendorForm] = useState(false);
    const [vendorForm, setVendorForm] = useState({ name: '', email: '', phone: '', address: '' });
    const [editingVendor, setEditingVendor] = useState<any>(null);
    const [selectedVendorForDetail, setSelectedVendorForDetail] = useState<any>(null);
    const [vendorProducts, setVendorProducts] = useState<any[]>([]);
    const [showLinkProductModal, setShowLinkProductModal] = useState(false);
    const [linkProductForm, setLinkProductForm] = useState({ productId: '', costPrice: '' });

    // Purchase Orders
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [showPOModal, setShowPOModal] = useState(false);
    const [editingPO, setEditingPO] = useState<any>(null);
    const [poForm, setPOForm] = useState({ vendorId: '', warehouseId: '', items: [] as any[] });
    const [showReceiveModal, setShowReceiveModal] = useState<any>(null);
    const [movements, setMovements] = useState<any[]>([]);

    // Stocktake
    const [stocktakeWarehouseId, setStocktakeWarehouseId] = useState('');
    const [stocktakeItems, setStocktakeItems] = useState<any[]>([]);

    // PO Receiving & Filters
    const [poReceivedItems, setPoReceivedItems] = useState<any[]>([]);
    const [poFilterStatus, setPoFilterStatus] = useState<string>('ALL');
    const [poFilterVendor, setPoFilterVendor] = useState<string>('ALL');

    // AI Predictive Inventory State
    const [inventoryPredictions, setInventoryPredictions] = useState<any[]>([]);
    const [loadingPredictions, setLoadingPredictions] = useState(false);

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const [loading, setLoading] = useState(true);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAll = async () => {
        setLoading(true);
        const h = getHeaders();
        try {
            const [pRes, wRes] = await Promise.all([
                fetchWithAuth('/retail/products'),
                fetchWithAuth('/retail/inventory/warehouses'),
            ]);
            if (pRes.ok) {
                const result = await pRes.json();
                const d = result.data !== undefined ? result.data : result;
                setProducts(Array.isArray(d) ? d : []);
            }
            if (wRes.ok) setWarehouses(await wRes.json().then(d => d.data || (Array.isArray(d) ? d : [])));
            if (!pRes.ok || !wRes.ok) throw new Error();
        } catch {
            showToast('Failed to load inventory data', 'error');
        }
        setLoading(false);
    };

    const fetchTransfers = async () => {
        try {
            const res = await fetchWithAuth('/retail/transfers');
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setTransfers(Array.isArray(d) ? d : []);
            }
            else throw new Error();
        } catch {
            showToast('Failed to load transfers', 'error');
        }
    };

    const fetchVendors = async () => {
        try {
            const res = await fetch(`${API_URL}/retail/vendors`, { headers: getHeaders() });
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setVendors(Array.isArray(d) ? d : []);
            }
            else throw new Error();
        } catch {
            showToast('Failed to load vendors', 'error');
        }
    };

    const fetchPurchaseOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/retail/purchase-orders`, { headers: getHeaders() });
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setPurchaseOrders(Array.isArray(d) ? d : []);
            }
        } catch { }
    };

    const fetchMovements = async () => {
        try {
            const res = await fetchWithAuth('/retail/inventory/movements');
            if (res.ok) setMovements(await res.json().then(d => d.data || (Array.isArray(d) ? d : [])));
        } catch { }
    };

    const fetchInventoryPredictions = async () => {
        setLoadingPredictions(true);
        try {
            const res = await fetch(`${API_URL}/analytics/ai/inventory-predictions`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setInventoryPredictions(data);
            }
        } catch (err) {
            console.error('Failed to load inventory predictions', err);
        } finally {
            setLoadingPredictions(false);
        }
    };

    useEffect(() => {
        fetchAll();
        fetchTransfers();
        fetchVendors();
        fetchPurchaseOrders();
        fetchMovements();
        fetchInventoryPredictions();
    }, []);

    // Refresh movements when switching to history tab
    useEffect(() => {
        if (tab === 'history') fetchMovements();
    }, [tab]);

    // --- Warehouse CRUD ---
    const handleSaveWarehouse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingWarehouse ? 'PATCH' : 'POST';
            const url = editingWarehouse ? `${API_URL}/retail/inventory/warehouses/${editingWarehouse.id}` : `${API_URL}/retail/inventory/warehouses`;
            const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(warehouseForm) });
            if (!res.ok) throw new Error();
            showToast(editingWarehouse ? 'Warehouse updated' : 'Warehouse created');
            setShowWarehouseForm(false); setEditingWarehouse(null); setWarehouseForm({ name: '', location: '' }); fetchAll();
        } catch {
            showToast('Failed to save warehouse', 'error');
        }
    };

    // --- Stock Adjust ---
    const handleAdjustStock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/retail/inventory/adjust`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({ productId: selectedProduct.id, warehouseId: adjustForm.warehouseId, quantity: parseInt(adjustForm.quantity), type: adjustForm.type, reason: adjustForm.reason, referenceId: 'MANUAL' })
            });
            if (!res.ok) throw new Error();
            showToast('Stock adjusted successfully');
            setShowAdjustModal(false); setAdjustForm({ warehouseId: '', quantity: '', type: 'ADD', reason: '' });
            fetchAll();
            fetchMovements();
        } catch {
            showToast('Failed to adjust stock', 'error');
        }
    };

    // --- Transfers ---
    const handleCreateTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/retail/transfers`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...transferForm, quantity: parseInt(transferForm.quantity) }) });
            if (!res.ok) throw new Error();
            showToast('Transfer order created');
            setShowTransferModal(false); setTransferForm({ sourceId: '', destinationId: '', productId: '', quantity: '1' });
            fetchTransfers();
            fetchMovements();
        } catch {
            showToast('Failed to create transfer', 'error');
        }
    };
    const handleTransferStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`${API_URL}/retail/transfers/${id}/status`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status }) });
            if (!res.ok) throw new Error();
            showToast(`Transfer marked as ${status.toLowerCase()}`);
            fetchTransfers(); fetchAll();
        } catch {
            showToast('Failed to update transfer status', 'error');
        }
    };

    // --- Vendors ---
    const handleSaveVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let res;
            if (editingVendor) {
                res = await fetch(`${API_URL}/retail/vendors/${editingVendor.id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(vendorForm) });
            } else {
                res = await fetch(`${API_URL}/retail/vendors`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(vendorForm) });
            }
            if (!res.ok) throw new Error();
            showToast(editingVendor ? 'Vendor updated successfully' : 'Vendor added successfully');
            setShowVendorForm(false); setEditingVendor(null); setVendorForm({ name: '', email: '', phone: '', address: '' }); fetchVendors();
        } catch {
            showToast('Failed to save vendor', 'error');
        }
    };
    const handleDeleteVendor = async (id: string) => {
        showConfirm({
            title: 'Delete Vendor',
            message: 'Are you sure you want to delete this vendor? This action cannot be undone.',
            variant: 'DANGER',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_URL}/retail/vendors/${id}`, { method: 'DELETE', headers: getHeaders() });
                    if (!res.ok) throw new Error();
                    showToast('Vendor deleted');
                    if (selectedVendorForDetail?.id === id) setSelectedVendorForDetail(null);
                    fetchVendors();
                } catch {
                    showToast('Failed to delete vendor', 'error');
                }
            }
        });
    };

    // --- Vendor Products & POs ---
    const fetchVendorProducts = async (vendorId: string) => {
        try {
            const res = await fetch(`${API_URL}/retail/vendors/${vendorId}/products`, { headers: getHeaders() });
            const data = await res.json();
            if (res.ok) setVendorProducts(data.data || (Array.isArray(data) ? data : []));
        } catch { }
    };

    const handleLinkProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/retail/vendors/${selectedVendorForDetail.id}/products`, {
                method: 'POST', headers: getHeaders(), body: JSON.stringify({ productId: linkProductForm.productId, costPrice: parseFloat(linkProductForm.costPrice) })
            });
            if (!res.ok) throw new Error();
            showToast('Product linked to vendor');
            setShowLinkProductModal(false); setLinkProductForm({ productId: '', costPrice: '' });
            fetchVendorProducts(selectedVendorForDetail.id);
        } catch { showToast('Failed to link product', 'error'); }
    };

    const handleUnlinkProduct = async (productId: string) => {
        showConfirm({
            title: 'Unlink Product',
            message: 'Remove this product from vendor?',
            variant: 'WARNING',
            onConfirm: async () => {
                try {
                    await fetch(`${API_URL}/retail/vendors/${selectedVendorForDetail.id}/products/${productId}`, { method: 'DELETE', headers: getHeaders() });
                    showToast('Product unlinked');
                    fetchVendorProducts(selectedVendorForDetail.id);
                } catch { }
            }
        });
    };

    const handleSavePO = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingPO ? 'PATCH' : 'POST';
            const url = editingPO ? `${API_URL}/retail/purchase-orders/${editingPO.id}` : `${API_URL}/retail/purchase-orders`;
            const res = await fetch(url, {
                method, headers: getHeaders(), body: JSON.stringify(poForm)
            });
            if (!res.ok) throw new Error();
            showToast(editingPO ? 'Purchase Order updated' : 'Purchase Order created');
            setShowPOModal(false); setEditingPO(null); setPOForm({ vendorId: '', warehouseId: '', items: [] });
            fetchPurchaseOrders();
        } catch { showToast('Failed to save PO', 'error'); }
    };

    const handleUpdatePOStatus = async (id: string, status: string, items?: any[]) => {
        try {
            const body = { status, receivedItems: items || poReceivedItems };
            const res = await fetch(`${API_URL}/retail/purchase-orders/${id}/status`, {
                method: 'PATCH', headers: getHeaders(), body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error();
            showToast(`PO marked as ${status.toLowerCase()}`);
            setShowReceiveModal(null);
            setPoReceivedItems([]);
            fetchPurchaseOrders();
            fetchAll();
            fetchMovements();
        } catch { showToast('Failed to update PO', 'error'); }
    };

    const handleStocktakeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = {
                warehouseId: stocktakeWarehouseId,
                items: stocktakeItems.map(item => ({
                    productId: item.id,
                    physicalQuantity: item.physicalQuantity
                }))
            };
            const res = await fetch(`${API_URL}/retail/inventory/stocktake`, {
                method: 'POST', headers: getHeaders(), body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error();
            showToast('Stocktake completed successfully');
            setStocktakeWarehouseId('');
            setStocktakeItems([]);
            setTab('stock');
            fetchAll();
            fetchMovements();
        } catch { showToast('Failed to complete stocktake', 'error'); }
    };

    const prepareStocktake = (warehouseId: string) => {
        setStocktakeWarehouseId(warehouseId);
        const items = products.map(p => {
            const level = p.stockLevels?.find((sl: any) => sl.warehouseId === warehouseId);
            return {
                ...p,
                expectedQuantity: level ? level.quantity : 0,
                physicalQuantity: level ? level.quantity : 0 // Default to expected
            };
        });
        setStocktakeItems(items);
    };

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`text-slate-200 min-h-full ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4`}>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('inventory_title')}</h1>
                    <p className="text-muted-foreground text-lg">{t('inventory_subtitle')}</p>
                </div>
                {tab === 'stock' && (
                    <div className="relative">
                        <div className={`pointer-events-none absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center`}><Search className="h-4 w-4 text-muted-foreground" /></div>
                        <input type="text" placeholder={t('search_products')} value={search} onChange={e => setSearch(e.target.value)} className={`w-64 rounded-lg py-2.5 bg-card text-foreground ring-1 ring-slate-800 placeholder:text-muted-foreground focus:ring-success-500 sm:text-sm outline-none ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`} />
                    </div>
                )}
                {tab === 'warehouses' && (
                    <button onClick={() => setShowWarehouseForm(true)} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                        <Plus className="h-4 w-4" /> New Warehouse
                    </button>
                )}
                {tab === 'transfers' && (
                    <button onClick={() => setShowTransferModal(true)} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                        <ArrowRightLeft className="h-4 w-4" /> New Transfer
                    </button>
                )}
                {tab === 'vendors' && (
                    <button onClick={() => { setEditingVendor(null); setVendorForm({ name: '', email: '', phone: '', address: '' }); setShowVendorForm(true); }} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                        <Plus className="h-4 w-4" /> Add Vendor
                    </button>
                )}
                {tab === 'purchase-orders' && (
                    <button onClick={() => { setEditingPO(null); setPOForm({ vendorId: '', warehouseId: '', items: [] }); setShowPOModal(true); }} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                        <Plus className="h-4 w-4" /> New PO
                    </button>
                )}
            </div>

            {/* PO Filter Bar */}
            {tab === 'purchase-orders' && (
                <div className="flex gap-4 items-center bg-card/60 p-4 rounded-2xl border border-border mb-6">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filters:</span>
                    </div>
                    <select value={poFilterStatus} onChange={e => setPoFilterStatus(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-primary">
                        <option value="ALL">Status: All</option>
                        <option value="PENDING">Pending</option>
                        <option value="ORDERED">Ordered</option>
                        <option value="RECEIVED">Received</option>
                    </select>
                    <select value={poFilterVendor} onChange={e => setPoFilterVendor(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-white font-bold outline-none focus:border-primary">
                        <option value="ALL">Vendor: All</option>
                        {(Array.isArray(vendors) ? vendors : []).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border pb-px overflow-x-auto custom-scrollbar">
                {[
                    { id: 'stock', label: t('stock_levels'), Icon: Package },
                    { id: 'warehouses', label: t('warehouses'), Icon: MapPin },
                    { id: 'transfers', label: t('transfers'), Icon: ArrowRightLeft },
                    { id: 'vendors', label: t('vendors'), Icon: Building2 },
                    { id: 'purchase-orders', label: t('purchase_orders'), Icon: ShoppingBag },
                    { id: 'adjustments', label: t('adjustments'), Icon: GanttChartSquare },
                    { id: 'analytics', label: t('analytics'), Icon: Package },
                    { id: 'history', label: t('history'), Icon: Clock },
                    { id: 'stocktake', label: t('stocktake'), Icon: CheckCircle2 },
                    { id: 'ai-predictions', label: 'Smart Restock', Icon: Zap },
                ].map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setTab(id as any)} className={`whitespace-nowrap px-4 py-2.5 font-medium text-sm rounded-t-lg flex items-center gap-2 border-b-2 transition-colors ${tab === id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-slate-700 dark:hover:text-slate-300 hover:bg-muted/10 dark:hover:bg-muted/50'}`}>
                        <Icon className="h-4 w-4" />{label}
                    </button>
                ))}
            </div>

            {/* ─── Stock Levels Tab ─── */}
            {tab === 'stock' && (
                <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-800">
                        <thead className="bg-card">
                            <tr>
                                <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase text-muted-foreground">{t('product') || 'Product'}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('sku') || 'SKU'}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('total_stock') || 'Total Stock'}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('category') || 'Category'}</th>
                                <th className="py-4 pr-6 text-right text-xs font-semibold uppercase text-muted-foreground">{t('action') || 'Action'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-card/20">
                            {loading ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
                                : (!Array.isArray(filteredProducts) || filteredProducts.length === 0) ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No products found.</td></tr>
                                    : (Array.isArray(filteredProducts) ? filteredProducts : []).map(p => {
                                        const totalStock = p.stockLevels?.reduce((s: number, sl: any) => s + sl.quantity, 0) ?? 0;
                                        return (
                                            <tr key={p.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-4 pl-6 pr-3 font-medium text-slate-200">{p.name}</td>
                                                <td className="px-3 py-4 text-sm text-muted-foreground">{p.sku || '—'}</td>
                                                <td className="px-3 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full font-bold text-sm ${totalStock > 0 ? 'bg-primary/10 text-primary' : 'bg-error-500/10 text-error-400'}`}>{totalStock} units</span>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-muted-foreground">{p.category?.name || '—'}</td>
                                                <td className="py-4 pr-6 text-right">
                                                    <button onClick={() => { setSelectedProduct(p); setShowAdjustModal(true); }} className="text-primary hover:text-success-300 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary/10 flex items-center gap-1.5 ml-auto">
                                                        <ArrowRightLeft className="h-4 w-4" /> Adjust
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ─── Warehouses Tab ─── */}
            {tab === 'warehouses' && (
                <div>
                    {showWarehouseForm && (
                        <form onSubmit={handleSaveWarehouse} className="mb-6 p-6 bg-card border border-border rounded-xl flex flex-wrap gap-4 items-end animate-in slide-in-from-top duration-300">
                            <div className="flex-1 min-w-40 space-y-1">
                                <label className="text-xs text-muted-foreground uppercase font-semibold">{editingWarehouse ? 'Edit' : 'New'} Location Name</label>
                                <input required placeholder="e.g. Main Stockroom" value={warehouseForm.name} onChange={e => setWarehouseForm({ ...warehouseForm, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-40 space-y-1">
                                <label className="text-xs text-muted-foreground uppercase font-semibold">Physical Address</label>
                                <input placeholder="e.g. Floor 2, Building A" value={warehouseForm.location} onChange={e => setWarehouseForm({ ...warehouseForm, location: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary transition-colors" />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setShowWarehouseForm(false); setEditingWarehouse(null); setWarehouseForm({ name: '', location: '' }); }} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary text-white rounded-lg font-medium shadow-lg shadow-success-600/20 transition-all active:scale-95">{editingWarehouse ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {warehouses.length === 0
                            ? <p className="col-span-3 text-center py-12 text-muted-foreground">No warehouses configured.</p>
                            : (Array.isArray(warehouses) ? warehouses : []).map(w => (
                                <div key={w.id} className="bg-card/60 border border-border rounded-xl p-5 hover:border-slate-700 transition-colors group relative overflow-hidden">
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg"><MapPin className="h-5 w-5 text-primary" /></div>
                                            <div>
                                                <h3 className="font-semibold text-white leading-tight">{w.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">{w.location || 'No address set'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingWarehouse(w);
                                                setWarehouseForm({ name: w.name, location: w.location || '' });
                                                setShowWarehouseForm(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-muted hover:bg-muted-foreground text-muted-foreground hover:text-white transition-all shadow-xl"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-border pt-3">
                                        <span className="text-muted-foreground">SKUs tracked</span>
                                        <span className="text-slate-300 font-medium text-right">{w.stockLevels?.length ?? 0}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* ─── Transfers Tab ─── */}
            {tab === 'transfers' && (
                <div>
                    {showTransferModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                                <div className="p-6 border-b border-border">
                                    <h2 className="text-xl font-bold text-white">Create Transfer Order</h2>
                                    <p className="text-muted-foreground text-sm mt-1">Move stock between your warehouse locations.</p>
                                </div>
                                <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Product</label>
                                        <select required value={transferForm.productId} onChange={e => setTransferForm({ ...transferForm, productId: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none">
                                            <option value="" disabled>Select product...</option>
                                            {(Array.isArray(products) ? products : []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">From</label>
                                            <select required value={transferForm.sourceId} onChange={e => setTransferForm({ ...transferForm, sourceId: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none">
                                                <option value="" disabled>Source...</option>
                                                {(Array.isArray(warehouses) ? warehouses : []).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">To</label>
                                            <select required value={transferForm.destinationId} onChange={e => setTransferForm({ ...transferForm, destinationId: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none">
                                                <option value="" disabled>Destination...</option>
                                                {(Array.isArray(warehouses) ? warehouses : []).filter(w => w.id !== transferForm.sourceId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
                                        <input required type="number" min="1" value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white" />
                                    </div>
                                    <div className="flex gap-3 pt-4 border-t border-border">
                                        <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 px-4 py-2 bg-muted hover:bg-muted-foreground text-white rounded-lg">Cancel</button>
                                        <button type="submit" className="flex-1 px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg font-medium">Create Transfer</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-card">
                                <tr>
                                    <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase text-muted-foreground">{t('product') || 'Product'}</th>
                                    <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('route') || 'Route'}</th>
                                    <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('qty') || 'Qty'}</th>
                                    <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('status') || 'Status'}</th>
                                    <th className="py-4 pr-6 text-right text-xs font-semibold uppercase text-muted-foreground">{t('actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-card/20">
                                {transfers.length === 0
                                    ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No transfers yet.</td></tr>
                                    : (Array.isArray(transfers) ? transfers : []).map(t => {
                                        const badge = STATUS_BADGES[t.status] || STATUS_BADGES.PENDING;
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-4 pl-6 pr-3 font-medium text-slate-200">{t.product?.name || '—'}</td>
                                                <td className="px-3 py-4 text-sm text-muted-foreground flex items-center gap-2">{t.source?.name}<ArrowRight className="h-3 w-3 text-slate-600 flex-shrink-0" />{t.destination?.name}</td>
                                                <td className="px-3 py-4 text-slate-300 font-medium">{t.quantity}</td>
                                                <td className="px-3 py-4">
                                                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                                                        <BadgeIcon className="h-3.5 w-3.5" />{badge.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-6 text-right space-x-2">
                                                    {t.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleTransferStatus(t.id, 'COMPLETED')} className="text-xs text-primary hover:text-success-300 px-3 py-1.5 rounded bg-primary/10 hover:bg-primary/20 border border-primary/20">Complete</button>
                                                            <button onClick={() => handleTransferStatus(t.id, 'CANCELLED')} className="text-xs text-error-400 hover:text-error-300 px-3 py-1.5 rounded bg-error-500/10 hover:bg-error-500/20 border border-error-500/20">Cancel</button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Vendors Tab ─── */}
            {tab === 'vendors' && (
                <div>
                    {!selectedVendorForDetail ? (
                        <>
                            {showVendorForm && (
                                <div className="mb-6 p-6 bg-card border border-border rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                    <h3 className="text-lg font-semibold text-white mb-4">{editingVendor ? 'Edit' : 'Add'} Vendor / Supplier</h3>
                                    <form onSubmit={handleSaveVendor} className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground uppercase font-semibold">Company Name</label>
                                            <input required placeholder="e.g. Fresh Farms Co." value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground uppercase font-semibold">Email</label>
                                            <input type="email" placeholder="contact@vendor.com" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground uppercase font-semibold">Phone</label>
                                            <input placeholder="+1 555 000 0000" value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-muted-foreground uppercase font-semibold">Address</label>
                                            <input placeholder="123 Main St, City" value={vendorForm.address} onChange={e => setVendorForm({ ...vendorForm, address: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500" />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-3 pt-2">
                                            <button type="button" onClick={() => { setShowVendorForm(false); setEditingVendor(null); }} className="px-4 py-2 text-muted-foreground hover:text-white">Cancel</button>
                                            <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" /> {editingVendor ? 'Update' : 'Add'} Vendor
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                                <table className="min-w-full divide-y divide-slate-800">
                                    <thead className="bg-card">
                                        <tr>
                                            <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase text-muted-foreground">{t('vendor') || 'Vendor'}</th>
                                            <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('contact') || 'Contact'}</th>
                                            <th className="px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground">{t('address') || 'Address'}</th>
                                            <th className="py-4 pr-6 text-right text-xs font-semibold uppercase text-muted-foreground">{t('actions') || 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 bg-card/20">
                                        {vendors.length === 0
                                            ? <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No vendors added yet.</td></tr>
                                            : (Array.isArray(vendors) ? vendors : []).map(v => (
                                                <tr key={v.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="py-4 pl-6 pr-3 cursor-pointer" onClick={() => { setSelectedVendorForDetail(v); fetchVendorProducts(v.id); }}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20">
                                                                <Building2 className="h-5 w-5 text-purple-400" />
                                                            </div>
                                                            <span className="font-medium text-slate-200">{v.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-muted-foreground">
                                                        <div>{v.email || '—'}</div>
                                                        <div className="text-muted-foreground">{v.phone || ''}</div>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-muted-foreground">{v.address || '—'}</td>
                                                    <td className="py-4 pr-6 text-right space-x-2">
                                                        <button onClick={() => { setEditingVendor(v); setVendorForm({ name: v.name, email: v.email || '', phone: v.phone || '', address: v.address || '' }); setShowVendorForm(true); }} className="text-xs text-primary hover:text-primary-300 px-3 py-1.5 rounded bg-primary/10 border border-primary/20">Edit</button>
                                                        <button onClick={() => handleDeleteVendor(v.id)} className="text-xs text-error-400 hover:text-error-300 px-3 py-1.5 rounded bg-error-500/10 border border-error-500/20"><Trash2 className="h-3.5 w-3.5 inline" /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedVendorForDetail(null)} className="p-2 rounded-lg bg-muted hover:bg-muted-foreground text-muted-foreground hover:text-white transition-colors">
                                    <Plus className="h-5 w-5 rotate-45" />
                                </button>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedVendorForDetail.name}</h2>
                                    <p className="text-muted-foreground text-sm">{selectedVendorForDetail.email} • {selectedVendorForDetail.phone}</p>
                                </div>
                                <button onClick={() => setShowLinkProductModal(true)} className="ml-auto flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    <Plus className="h-4 w-4" /> Link Product
                                </button>
                            </div>

                            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                                <div className="p-4 bg-card border-b border-border">
                                    <h3 className="font-semibold text-slate-300">Supplied Products & Costing</h3>
                                </div>
                                <table className="min-w-full divide-y divide-slate-800">
                                    <thead>
                                        <tr className="bg-card/50">
                                            <th className="py-3 pl-6 text-left text-xs font-semibold uppercase text-muted-foreground">{t('product') || 'Product'}</th>
                                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{t('last_cost') || 'Last Cost'}</th>
                                            <th className="py-3 pr-6 text-right text-xs font-semibold uppercase text-muted-foreground">{t('actions') || 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {(!Array.isArray(vendorProducts) || vendorProducts.length === 0) ? (
                                            <tr><td colSpan={3} className="py-12 text-center text-muted-foreground">No products linked to this vendor.</td></tr>
                                        ) : (Array.isArray(vendorProducts) ? vendorProducts : []).map(vp => (
                                            <tr key={vp.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-4 pl-6 text-slate-200 font-medium">{vp.product?.name}</td>
                                                <td className="px-3 py-4 text-purple-400 font-bold">{formatCurrency(parseFloat(vp.costPrice))}</td>
                                                <td className="py-4 pr-6 text-right">
                                                    <button onClick={() => handleUnlinkProduct(vp.productId)} className="text-error-400 hover:text-error-300 p-2 rounded-lg hover:bg-error-500/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Purchase Orders Tab ─── */}
            {tab === 'purchase-orders' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-card p-5 rounded-2xl border border-border shadow-xl">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" /> Purchase Orders
                            </h2>
                            <p className="text-muted-foreground text-sm mt-0.5">Manage stock procurement from suppliers</p>
                        </div>
                        <button onClick={() => setShowPOModal(true)} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-success-600/20 transition-all hover:scale-[1.02]">
                            <Plus className="h-4 w-4" /> New PO
                        </button>
                    </div>

                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl backdrop-blur-md">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-card/80">
                                <tr>
                                    <th className="py-4 pl-6 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('po_number') || 'PO Number'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('vendor') || 'Vendor'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('status') || 'Status'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('date') || 'Date'}</th>
                                    <th className="py-4 pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('actions') || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {(!Array.isArray(purchaseOrders) || purchaseOrders.filter(po => {
                                    if (poFilterStatus !== 'ALL' && po.status !== poFilterStatus) return false;
                                    if (poFilterVendor !== 'ALL' && po.vendorId !== poFilterVendor) return false;
                                    return true;
                                }).length === 0) ? (
                                    <tr><td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground text-sm">No purchase orders matching filters.</p>
                                        </div>
                                    </td></tr>
                                ) : purchaseOrders.filter(po => {
                                    if (poFilterStatus !== 'ALL' && po.status !== poFilterStatus) return false;
                                    if (poFilterVendor !== 'ALL' && po.vendorId !== poFilterVendor) return false;
                                    return true;
                                }).map(po => (
                                    <tr key={po.id} className="hover:bg-muted/40 transition-colors group">
                                        <td className="py-4 pl-6 font-mono text-primary font-bold text-sm tracking-tight">{po.number}</td>
                                        <td className="px-3 py-4 text-slate-200 font-medium">{po.vendor?.name}</td>
                                        <td className="px-3 py-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${po.status === 'RECEIVED' ? 'bg-primary/10 text-primary border border-primary/20' :
                                                po.status === 'PENDING' ? 'bg-slate-500/10 text-muted-foreground border border-slate-500/20' :
                                                    'bg-warning-500/10 text-warning-400 border border-warning-500/20'
                                                }`}>
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-muted-foreground text-xs">{new Date(po.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 pr-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {po.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingPO(po);
                                                            setPOForm({
                                                                vendorId: po.vendorId,
                                                                warehouseId: po.warehouseId,
                                                                items: po.items?.map((i: any) => ({
                                                                    productId: i.productId,
                                                                    quantity: i.quantity,
                                                                    costPrice: i.costPrice
                                                                })) || []
                                                            });
                                                            setShowPOModal(true);
                                                        }}
                                                        className="text-[11px] bg-muted hover:bg-muted-foreground text-slate-300 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Pencil className="h-3 w-3" /> Edit
                                                    </button>
                                                )}
                                                {po.status !== 'RECEIVED' && (
                                                    <button onClick={() => {
                                                        setShowReceiveModal(po);
                                                        setPoReceivedItems(po.items?.map((i: any) => ({
                                                            productId: i.productId,
                                                            product: i.product,
                                                            quantity: i.quantity // Initialize with ordered quantity
                                                        })) || []);
                                                    }} className="text-[11px] bg-primary hover:bg-primary text-white font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                                                        Mark Received
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Predictive Inventory Tab ─── */}
            {tab === 'ai-predictions' && (
                <div className="space-y-6">
                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-48 h-48 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">AI Predictive Restock</h2>
                            </div>
                            <p className="max-w-2xl text-muted-foreground text-lg leading-relaxed">
                                Our AI analyzes your sales velocity over the last 14 days and compares it with current stock across all warehouses to predict exactly when you'll run out and what you need to order.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
                                <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-200 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-warning-500" /> Procurement Priority
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Based on 14-day velocity</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-800">
                                        <thead>
                                            <tr>
                                                <th className="py-4 pl-6 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                                                <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</th>
                                                <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Velocity</th>
                                                <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Runs Out In</th>
                                                <th className="px-3 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Suggested Order</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50">
                                            {loadingPredictions ? (
                                                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground animate-pulse">Calculating predictions...</td></tr>
                                            ) : inventoryPredictions.length === 0 ? (
                                                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground italic">No restock needs identified yet. Stock levels are healthy!</td></tr>
                                            ) : (
                                                inventoryPredictions.map(item => (
                                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                                        <td className="py-4 pl-6">
                                                            <div className="font-bold text-slate-200">{item.name}</div>
                                                            <div className={`text-[10px] font-black mt-0.5 uppercase tracking-tight ${item.status === 'CRITICAL' ? 'text-error-500' : 'text-warning-500'}`}>
                                                                {item.status}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 text-muted-foreground font-medium">{item.currentStock} units</td>
                                                        <td className="px-3 py-4 text-muted-foreground font-medium">{item.avgDailySales}/day</td>
                                                        <td className="px-3 py-4">
                                                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${item.daysRemaining === '∞' ? 'bg-primary/10 text-primary' : (parseInt(item.daysRemaining) < 3 ? 'bg-error-500/10 text-error-500' : 'bg-warning-500/10 text-warning-500')}`}>
                                                                {item.daysRemaining} {item.daysRemaining !== '∞' ? 'days' : ''}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-primary font-black">+{item.recommendedRestock}</span>
                                                                <button onClick={() => { setTab('purchase-orders'); setShowPOModal(true); }} className="p-1 rounded bg-muted-foreground text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
                                <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary" /> Restock Strategy
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/30 rounded-xl border border-slate-700">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Replenishment Cycle</p>
                                        <p className="text-sm font-bold text-slate-200">14 Days</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">Our AI suggests quantities to cover exactly 2 weeks of sales based on current momentum.</p>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-xl border border-slate-700">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Safety Stock</p>
                                        <p className="text-sm font-bold text-slate-200">Enabled (3-Day buffer)</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">Critical alerts trigger when stock drops below 3 days of projected demand.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setTab('purchase-orders')}
                                className="w-full bg-primary hover:bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-success-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-5 h-5" /> CREATE BULK PURCHASE ORDER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Analytics Tab ─── */}
            {/* ─── Adjustments Tab ─── */}
            {tab === 'adjustments' && (
                <div className="space-y-6">
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-xl">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <GanttChartSquare className="h-5 w-5 text-warning-400" /> Manual Adjustments Registry
                        </h2>
                        <p className="text-muted-foreground text-sm mt-0.5">Audit log of all manual stock corrections and losses.</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl backdrop-blur-md">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-card/80">
                                <tr>
                                    <th className="py-4 pl-6 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('date_time') || 'Date & Time'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('product') || 'Product'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('warehouse') || 'Warehouse'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('change') || 'Change'}</th>
                                    <th className="py-4 pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('reason_ref') || 'Reason / Ref'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {movements.filter(m => m.type === 'ADJUSTMENT').length === 0 ? (
                                    <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">No manual adjustments found.</td></tr>
                                ) : movements.filter(m => m.type === 'ADJUSTMENT').map(m => (
                                    <tr key={m.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="py-4 pl-6 text-muted-foreground text-xs">{new Date(m.createdAt).toLocaleString()}</td>
                                        <td className="px-3 py-4 font-bold text-slate-200">{m.product?.name}</td>
                                        <td className="px-3 py-4 text-muted-foreground text-sm">{m.warehouse?.name}</td>
                                        <td className="px-3 py-4">
                                            <span className={`font-black text-sm ${m.quantity > 0 ? 'text-primary' : 'text-error-400'}`}>
                                                {m.quantity > 0 ? '+' : ''}{m.quantity}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-6 text-right font-mono text-[10px] text-muted-foreground">{m.referenceId || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'analytics' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Total Suppliers', val: vendors.length, Icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
                            { label: 'Active Orders', val: purchaseOrders.filter(p => p.status !== 'RECEIVED').length, Icon: ShoppingBag, color: 'text-warning-400', bg: 'bg-warning-500/10' },
                            { label: 'Total Spend (Monthly)', val: '$0.00', Icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
                        ].map((stat, i) => (
                            <div key={i} className="p-6 bg-card/60 border border-border rounded-2xl relative overflow-hidden group shadow-lg">
                                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}>
                                    <stat.Icon className="h-16 w-16" />
                                </div>
                                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
                                <p className={`text-4xl font-black mt-2 tracking-tighter ${stat.color}`}>{stat.val}</p>
                                <div className={`mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${stat.bg} ${stat.color} text-[10px] font-bold`}>
                                    <CheckCircle2 className="h-3 w-3" /> Live Data
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative group p-12 lg:p-20 text-center rounded-[2rem] bg-card border border-border/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                        {/* AI Background Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
                        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] pointer-events-none" />

                        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
                            <div className="relative inline-flex">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                <div className="bg-background/80 border border-primary/30 p-5 rounded-3xl shadow-xl shadow-success-500/10">
                                    <TrendingUp className="h-10 w-10 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                                    <GitBranch className="h-3 w-3" /> AI Predictive Engine
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tight uppercase italic underline decoration-success-500/50 decoration-4 underline-offset-8">
                                    Deep Insights <span className="text-primary ml-1">v2.0</span>
                                </h3>
                                <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                                    We're training AI to analyze your vendor pricing trends and delivery performance.
                                    <span className="block text-muted-foreground mt-2 italic">Start creating more orders to unlock predictive restocking suggestions.</span>
                                </p>
                            </div>

                            <button className="px-8 py-3.5 bg-primary hover:bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-success-600/20 transition-all hover:scale-[1.02] active:scale-95 border border-success-400/20">
                                Prepare My Supply Chain
                            </button>
                        </div>

                        {/* Animated decorative elements */}
                        <div className="absolute bottom-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package className="h-32 w-32 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            )}

            {/* ─── History Tab ─── */}
            {tab === 'history' && (
                <div className="space-y-6">
                    <div className="bg-card p-5 rounded-2xl border border-border shadow-xl">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" /> Stock Transaction History
                        </h2>
                        <p className="text-muted-foreground text-sm mt-0.5">Chronological log of all inventory movements.</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl backdrop-blur-md">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-card/80">
                                <tr>
                                    <th className="py-4 pl-6 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('date_time') || 'Date & Time'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('product') || 'Product'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('warehouse') || 'Warehouse'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('type') || 'Type'}</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('change') || 'Change'}</th>
                                    <th className="py-4 pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('ref') || 'Ref'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {(!Array.isArray(movements) || movements.length === 0) ? (
                                    <tr><td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-40">
                                            <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                                            <p className="text-muted-foreground text-sm">No inventory movements recorded yet.</p>
                                        </div>
                                    </td></tr>
                                ) : movements.map(m => (
                                    <tr key={m.id} className="hover:bg-muted/40 transition-colors group">
                                        <td className="py-4 pl-6 text-xs text-muted-foreground">
                                            <div className="font-bold text-slate-300">{new Date(m.createdAt).toLocaleDateString()}</div>
                                            <div className="text-[10px] opacity-70">{new Date(m.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="text-slate-200 font-bold text-sm tracking-tight">{m.product?.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono tracking-tighter">{m.product?.sku}</div>
                                        </td>
                                        <td className="px-3 py-4 text-muted-foreground text-sm font-medium">{m.warehouse?.name}</td>
                                        <td className="px-3 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${m.type === 'RESTOCK' ? 'bg-primary/10 text-primary border-primary/20' :
                                                m.type === 'SALE' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    m.type === 'ADJUSTMENT' ? 'bg-warning-500/10 text-warning-400 border-warning-500/20' :
                                                        'bg-error-500/10 text-error-400 border-error-500/20'
                                                }`}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={`text-sm font-black ${m.quantity > 0 ? 'text-primary' : 'text-error-400'}`}>
                                                {m.quantity > 0 ? '+' : ''}{m.quantity}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-6 text-right font-mono text-[10px] text-muted-foreground italic">
                                            {m.referenceId || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Link Product Modal */}
            {showLinkProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-white tracking-tight">Link Product to Supplier</h2>
                            <p className="text-muted-foreground text-sm mt-1">Set the supply cost for this item.</p>
                        </div>
                        <form onSubmit={handleLinkProduct} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Product</label>
                                <select required value={linkProductForm.productId} onChange={e => setLinkProductForm({ ...linkProductForm, productId: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50">
                                    <option value="">Select a product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Supplier Cost ($)</label>
                                <input required type="number" step="0.01" placeholder="0.00" value={linkProductForm.costPrice} onChange={e => setLinkProductForm({ ...linkProductForm, costPrice: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setShowLinkProductModal(false)} className="flex-1 px-4 py-2 text-muted-foreground font-bold">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20">Link Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create PO Modal */}
            {showPOModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-card/50">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{editingPO ? 'Edit' : 'Create'} Purchase Order</h2>
                                <p className="text-muted-foreground text-xs mt-0.5 font-medium tracking-tight">Order stock items from your vendors.</p>
                            </div>
                            <button onClick={() => { setShowPOModal(false); setEditingPO(null); setPOForm({ vendorId: '', warehouseId: '', items: [] }); }} className="p-2 hover:bg-muted rounded-xl text-slate-600 hover:text-error-500 transition-colors"><XCircle className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleSavePO} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Vendor</label>
                                    <select required value={poForm.vendorId} onChange={e => setPOForm({ ...poForm, vendorId: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white">
                                        <option value="">Select Vendor...</option>
                                        {(Array.isArray(vendors) ? vendors : []).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Destination Warehouse</label>
                                    <select required value={poForm.warehouseId} onChange={e => setPOForm({ ...poForm, warehouseId: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white">
                                        <option value="">Select Warehouse...</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-muted-foreground uppercase block">Order Items</label>
                                {poForm.items.length === 0 ? (
                                    <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-slate-600">
                                        No items added to this PO.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {(Array.isArray(poForm.items) ? poForm.items : []).map((item, idx) => (
                                            <div key={idx} className="flex gap-3 bg-background border border-border p-3 rounded-xl items-center">
                                                <div className="flex-1 text-sm font-medium text-slate-200">
                                                    {products.find(p => p.id === item.productId)?.name || 'Unknown Product'}
                                                </div>
                                                <div className="w-20">
                                                    <input type="number" value={item.quantity} onChange={e => {
                                                        const newItems = [...poForm.items];
                                                        newItems[idx].quantity = parseInt(e.target.value);
                                                        setPOForm({ ...poForm, items: newItems });
                                                    }} className="w-full bg-card border border-border rounded-lg px-2 py-1 text-center text-sm" />
                                                </div>
                                                <div className="w-24 text-right text-primary font-bold text-sm">
                                                    {formatCurrency(item.costPrice * item.quantity)}
                                                </div>
                                                <button type="button" onClick={() => {
                                                    const newItems = poForm.items.filter((_, i) => i !== idx);
                                                    setPOForm({ ...poForm, items: newItems });
                                                }} className="text-error-500 hover:text-error-400 p-1"><XCircle className="h-5 w-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <select onChange={e => {
                                        const pid = e.target.value;
                                        if (!pid) return;
                                        const p = products.find(px => px.id === pid);
                                        setPOForm({ ...poForm, items: [...poForm.items, { productId: pid, quantity: 1, costPrice: p?.costPrice || 0 }] });
                                        e.target.value = '';
                                    }} className="flex-1 bg-muted border-none rounded-xl px-4 py-2 text-sm text-slate-300">
                                        <option value="">+ Add Product...</option>
                                        {(Array.isArray(products) ? products : []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-success-900/20 transition-all active:scale-95">
                                GENERATE PURCHASE ORDER
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Receive PO Modal */}
            {showReceiveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
                        <div className="p-6 border-b border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white tracking-tight">Receive Inventory</h2>
                                    <p className="text-primary text-xs font-bold font-mono mt-0.5">{showReceiveModal.number}</p>
                                </div>
                                <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-black border border-primary/20 uppercase tracking-widest">Inbound</div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground">Verifying arrivals from <span className="text-white font-bold">{showReceiveModal.vendor?.name}</span>. Confirm quantities below to update stock levels.</p>
                            <div className="space-y-3">
                                {poReceivedItems.map((item: any, idx) => (
                                    <div key={item.productId} className="flex justify-between items-center p-3 bg-background rounded-xl border border-border/50">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-200">{item.product?.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest italic">{item.product?.sku}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-2">
                                                <p className="text-[9px] text-slate-600 uppercase font-black">Ordered</p>
                                                <p className="text-xs text-muted-foreground font-bold">{showReceiveModal.items?.find((i: any) => i.productId === item.productId)?.quantity}</p>
                                            </div>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => {
                                                    const newItems = [...poReceivedItems];
                                                    newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                    setPoReceivedItems(newItems);
                                                }}
                                                className="w-20 bg-card border border-slate-700 rounded-lg py-2 text-center text-primary font-black focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 flex gap-3 border-t border-border">
                                <button onClick={() => setShowReceiveModal(null)} className="flex-1 py-3 text-muted-foreground font-bold hover:text-white transition-colors">Abort</button>
                                <button onClick={() => handleUpdatePOStatus(showReceiveModal.id, 'RECEIVED')} className="flex-[2] py-3 bg-primary hover:bg-primary text-white font-black rounded-xl shadow-lg transition-all active:scale-95">
                                    CONFIRM RECEIPT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Adjust Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-border relative">
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-warning-500" /> Adjust Stock
                            </h2>
                            <p className="text-muted-foreground font-medium mt-1">{selectedProduct?.name}</p>
                            <div className="absolute top-8 right-8 bg-background border border-border px-3 py-1 rounded-full text-[10px] font-black uppercase text-muted-foreground tracking-widest">Manual Correction</div>
                        </div>
                        <form onSubmit={handleAdjustStock} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Location</label>
                                    <select required value={adjustForm.warehouseId} onChange={e => setAdjustForm({ ...adjustForm, warehouseId: e.target.value })} className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-white focus:border-primary outline-none transition-all font-bold">
                                        <option value="" disabled>Select Warehouse...</option>
                                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                    {adjustForm.warehouseId && (
                                        <div className="mt-2 text-[10px] font-bold text-primary ml-1 flex items-center gap-1">
                                            Current Balance: <span className="text-white px-2 py-0.5 bg-muted rounded">{selectedProduct?.stockLevels?.find((sl: any) => sl.warehouseId === adjustForm.warehouseId)?.quantity || 0} units</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Method</label>
                                        <select value={adjustForm.type} onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value })} className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-white font-bold focus:border-primary outline-none">
                                            <option value="ADD">Add (+)</option>
                                            <option value="REMOVE">Remove (-)</option>
                                            <option value="SET">Override (=)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Quantity</label>
                                        <input required type="number" min="1" value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })} className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-white text-lg font-black focus:border-primary outline-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Primary Reason</label>
                                    <select value={adjustForm.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-white font-bold focus:border-primary outline-none">
                                        <option value="">Specific Reason...</option>
                                        <option value="DAMAGE">Damaged Goods</option>
                                        <option value="THEFT">Theft / Loss</option>
                                        <option value="EXPIRY">Expired Product</option>
                                        <option value="GIFT">Promotion / Gift</option>
                                        <option value="RECONCILE">Inventory Correction</option>
                                        <option value="SHRINKAGE">Shrinkage</option>
                                    </select>
                                </div>
                            </div>

                            {/* Preview Section */}
                            {adjustForm.warehouseId && adjustForm.quantity && (
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Balance Preview</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-xs font-bold line-through">{selectedProduct?.stockLevels?.find((sl: any) => sl.warehouseId === adjustForm.warehouseId)?.quantity || 0}</span>
                                            <ArrowRight className="h-3 w-3 text-primary" />
                                            <span className="text-primary font-black text-lg">
                                                {(() => {
                                                    const cur = selectedProduct?.stockLevels?.find((sl: any) => sl.warehouseId === adjustForm.warehouseId)?.quantity || 0;
                                                    const val = parseInt(adjustForm.quantity) || 0;
                                                    if (adjustForm.type === 'ADD') return cur + val;
                                                    if (adjustForm.type === 'REMOVE') return Math.max(0, cur - val);
                                                    return val;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-6 border-t border-border">
                                <button type="button" onClick={() => setShowAdjustModal(false)} className="flex-1 px-4 py-3 text-muted-foreground font-bold hover:text-white transition-colors">Abort</button>
                                <button type="submit" className="flex-2 px-8 py-3 bg-primary hover:bg-primary text-white rounded-2xl font-black shadow-xl shadow-success-950/20 transition-all hover:scale-[1.02] active:scale-95">COMMIT ADJUSTMENT</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Stocktake Tab ─── */}
            {tab === 'stocktake' && (
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-xl flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" /> Inventory Stocktake
                            </h2>
                            <p className="text-muted-foreground text-sm mt-0.5">Physical count reconciliation for warehouse locations.</p>
                        </div>
                        {!stocktakeWarehouseId ? null : (
                            <button onClick={() => setStocktakeWarehouseId('')} className="text-xs text-error-400 hover:text-error-300 font-bold uppercase tracking-widest bg-error-500/10 px-4 py-2 rounded-xl border border-error-500/20">
                                Switch Warehouse
                            </button>
                        )}
                    </div>

                    {!stocktakeWarehouseId ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(Array.isArray(warehouses) ? warehouses : []).map(w => (
                                <button key={w.id} onClick={() => prepareStocktake(w.id)} className="p-8 bg-card border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group text-left shadow-lg">
                                    <MapPin className="h-10 w-10 text-slate-700 group-hover:text-primary mb-4 transition-colors" />
                                    <h3 className="text-lg font-bold text-white">{w.name}</h3>
                                    <p className="text-muted-foreground text-sm mt-1">{w.location || 'Central Location'}</p>
                                    <div className="mt-6 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Start Stocktake <ArrowRight className="h-4 w-4" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleStocktakeSubmit} className="space-y-6">
                            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
                                <table className="min-w-full divide-y divide-slate-800">
                                    <thead className="bg-card">
                                        <tr>
                                            <th className="py-4 pl-6 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('product') || 'Product'}</th>
                                            <th className="px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('expected') || 'Expected'}</th>
                                            <th className="px-3 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('physical_count') || 'Physical Count'}</th>
                                            <th className="px-3 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('variance') || 'Variance'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {(Array.isArray(stocktakeItems) ? stocktakeItems : []).map((item, idx) => {
                                            const variance = item.physicalQuantity - item.expectedQuantity;
                                            return (
                                                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="py-4 pl-6 font-bold text-slate-200">
                                                        <div>{item.name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-mono italic">{item.sku}</div>
                                                    </td>
                                                    <td className="px-3 py-4 text-center text-muted-foreground font-medium">{item.expectedQuantity}</td>
                                                    <td className="px-3 py-4">
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="number"
                                                                value={item.physicalQuantity}
                                                                onChange={e => {
                                                                    const newItems = [...stocktakeItems];
                                                                    newItems[idx].physicalQuantity = parseInt(e.target.value) || 0;
                                                                    setStocktakeItems(newItems);
                                                                }}
                                                                className="w-24 bg-background border border-border rounded-lg py-2 text-center text-white font-bold focus:border-primary outline-none"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-right">
                                                        <span className={`text-sm font-black ${variance === 0 ? 'text-muted-foreground' : variance > 0 ? 'text-primary' : 'text-error-400'}`}>
                                                            {variance > 0 ? '+' : ''}{variance}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end gap-3 bg-card p-6 rounded-2xl border border-border">
                                <button type="button" onClick={() => setStocktakeWarehouseId('')} className="px-6 py-2.5 text-muted-foreground font-bold hover:text-white">Cancel</button>
                                <button type="submit" className="px-10 py-2.5 bg-primary hover:bg-primary text-white font-black rounded-xl shadow-lg shadow-success-600/20 transition-all hover:scale-[1.02]">
                                    SUBMIT RECONCILIATION
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl z-[100] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-primary/90 text-white border border-primary/20' : 'bg-error-600/90 text-white border border-error-500/20'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
