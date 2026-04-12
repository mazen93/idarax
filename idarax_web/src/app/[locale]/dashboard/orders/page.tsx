'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Receipt, CreditCard, Banknote, Calendar, Eye, X, User, MapPin, Clock, ChevronDown, Grid3X3, CheckCircle2, XCircle, Printer, MessageSquare, WifiOff, Download, FileSpreadsheet, Mail, Monitor, QrCode, Truck } from 'lucide-react';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';
import { printOrderReceipt } from '@/utils/printUtils';
import { getHeaders, hasPermission } from '@/utils/auth';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import * as offlineQueue from '@/lib/offlineQueue';
import { api } from '@/lib/api';
import ManagerOverrideModal from '@/components/ManagerOverrideModal';

// Cache keys
const CACHE_ORDERS = 'orders_cache';
const CACHE_ORDERS_TIME = 'orders_cache_time';

function saveOrdersCache(orders: any[]) {
    try {
        localStorage.setItem(CACHE_ORDERS, JSON.stringify(orders));
        localStorage.setItem(CACHE_ORDERS_TIME, new Date().toISOString());
    } catch { }
}
function loadOrdersCache(): { orders: any[], savedAt: string | null } {
    try {
        const raw = localStorage.getItem(CACHE_ORDERS);
        const savedAt = localStorage.getItem(CACHE_ORDERS_TIME);
        return { orders: raw ? JSON.parse(raw) : [], savedAt };
    } catch { return { orders: [], savedAt: null }; }
}


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';


const STATUS_STYLES: Record<string, string> = {
    COMPLETED: 'bg-primary/10 text-primary border-primary/30',
    PENDING: 'bg-warning-500/10 text-warning-400 border-warning-500/30',
    SCHEDULED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    PREPARING: 'bg-primary-500/10 text-primary-400 border-primary-500/30',
    READY: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    CANCELLED: 'bg-error-500/10 text-error-400 border-error-500/30',
    REFUNDED: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    QUEUED: 'bg-warning-500/10 text-warning-400 border-warning-500/30 border-dashed animate-pulse',
};

// Delivery stepper steps: maps Idarax statuses to delivery milestones
const DELIVERY_STEPS = [
    { key: 'PENDING',   label: 'Order Placed',   emoji: '📋' },
    { key: 'PREPARING', label: 'Preparing',       emoji: '👨‍🍳' },
    { key: 'READY',     label: 'Driver Assigned', emoji: '🛵' },
    { key: 'COMPLETED', label: 'Delivered',        emoji: '✅' },
];

function parseDriverFromNote(note?: string): { name?: string; phone?: string } {
    if (!note) return {};
    const nameMatch = note.match(/Driver: ([^-]+)/);
    const phoneMatch = note.match(/- (\+?[\d\s]+)/);
    return {
        name: nameMatch?.[1]?.trim(),
        phone: phoneMatch?.[1]?.trim(),
    };
}

const ALL_STATUSES = ['PENDING', 'SCHEDULED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

export default function LiveOrdersPage() {
    const { t, formatCurrency } = useLanguage();
    const { showAlert, showConfirm, showPrompt } = useModal();
    const isOnline = useOnlineStatus();
    const [orders, setOrders] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [usingCache, setUsingCache] = useState(false);
    const [cacheTime, setCacheTime] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterPayment, setFilterPayment] = useState('ALL');
    const [filterSource, setFilterSource] = useState('ALL');
    const [filterPaid, setFilterPaid] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingTable, setUpdatingTable] = useState(false);
    const [assignTableId, setAssignTableId] = useState('');
    const [settings, setSettings] = useState<any>(null);
    const [overrideAction, setOverrideAction] = useState<{ action: string, callback: (token: string) => void } | null>(null);

    // Payment Flow State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [payMethod, setPayMethod] = useState<'CASH' | 'CARD' | 'CREDIT'>('CASH');
    const [tenderedAmount, setTenderedAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            console.log('[OrdersPage] fetching orders with filters:', { startDate, endDate });
            const res = await api.get('/orders', {
                params: {
                    start: startDate || undefined,
                    end: endDate || undefined
                }
            });

            const fetched = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setOrders(fetched);
            saveOrdersCache(fetched);
            setUsingCache(false);
        } catch (err) {
            console.error('[OrdersPage] fetch error:', err);
            if (!navigator.onLine) {
                const { orders: cached, savedAt } = loadOrdersCache();
                if (cached.length > 0) {
                    setOrders(cached);
                    setUsingCache(true);
                    setCacheTime(savedAt);
                }
            }
        } finally {
            // Always merge in any queued offline orders
            const q = offlineQueue.getQueue();
            const queued = (Array.isArray(q) ? q : []).map(q => ({
                ...(q.displayMetadata || q.payload),
                id: q.id,
                status: 'QUEUED',
                isOffline: true
            }));
            if (queued.length > 0) {
                setOrders(prev => {
                    const existingIds = new Set(prev.map(o => o.id));
                    const uniqueQueued = queued.filter(q => !existingIds.has(q.id));
                    return [...uniqueQueued, ...prev];
                });
            }
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchOrders();
        fetch(`${API_URL}/restaurant/tables`, { headers: getHeaders() })
            .then(r => r.ok ? r.json() : [])
            .then(d => setTables(Array.isArray(d) ? d : d.data || []));

        fetch(`${API_URL}/tenant/settings`, { headers: getHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(d => setSettings(d));

        const iv = setInterval(fetchOrders, 15000);

        return () => clearInterval(iv);
    }, [fetchOrders, startDate, endDate]);

    const filtered = orders.filter(o => {
        const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) ||
            (o.customer?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
        const matchType = filterType === 'ALL' || o.orderType === filterType;
        const matchPayment = filterPayment === 'ALL' || o.paymentMethod === filterPayment;
        const matchSource = filterSource === 'ALL' || o.source === filterSource;
        const isPaid = Math.round(Number(o.paidAmount) * 100) >= Math.round(Number(o.totalAmount) * 100);
        const matchPaid = filterPaid === 'ALL' || (filterPaid === 'PAID' ? isPaid : !isPaid);

        return matchSearch && matchStatus && matchType && matchPayment && matchSource && matchPaid;
    });

    const updateStatus = async (orderId: string, status: string, paymentMethod?: string, paidAmount?: number) => {
        setUpdatingStatus(true);
        try {
            const res = await api.patch(`/orders/${orderId}/status`, { 
                status,
                paymentMethod,
                paidAmount
            });
            const updated = res.data;
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
            setSelectedOrder((prev: any) => prev?.id === orderId ? { ...prev, ...updated } : prev);
            return updated;
        } catch (err) {
            console.error('[OrdersPage] updateStatus error:', err);
            showAlert({ variant: 'DANGER', message: 'Failed to update order status' });
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!selectedOrder) return;
        setProcessingPayment(true);
        try {
            const balance = Number(selectedOrder.totalAmount) - Number(selectedOrder.paidAmount);
            const updated = await updateStatus(selectedOrder.id, 'COMPLETED', payMethod, balance);
            
            if (updated) {
                setShowPaymentModal(false);
                // Trigger Receipt Print
                const tenantInfo = { name: localStorage.getItem('tenant_name') || 'Restaurant' };
                printOrderReceipt(tenantInfo, updated, settings);
                showAlert({ variant: 'SUCCESS', message: t('order_settled_successfully') || 'Order settled successfully!' });
            }
        } catch (err) {
            console.error('Payment processing failed:', err);
        } finally {
            setProcessingPayment(false);
        }
    };

    const assignTable = async (orderId: string) => {
        if (!assignTableId) return;
        setUpdatingTable(true);
        try {
            const res = await api.patch(`/orders/${orderId}/table`, { tableId: assignTableId });
            const updated = res.data;
            const tbl = tables.find(t => t.id === assignTableId);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tableId: assignTableId, table: tbl, orderType: 'DINE_IN' } : o));
            setSelectedOrder((prev: any) => prev?.id === orderId ? { ...prev, tableId: assignTableId, table: tbl, orderType: 'DINE_IN' } : prev);
            setAssignTableId('');
        } catch (err) {
            console.error('[OrdersPage] assignTable error:', err);
        }
        setUpdatingTable(false);
    };

    const openOrder = (order: any) => {
        setSelectedOrder(order);
        setAssignTableId(order.tableId || '');
    };

    const handleRefundOrderTrigger = (orderId: string) => {
        if (!hasPermission('ORDERS:REFUND')) {
            setOverrideAction({
                action: 'ORDERS:REFUND',
                callback: (token) => handleRefundOrder(orderId, token)
            });
            return;
        }
        handleRefundOrder(orderId);
    };

    const handleRefundOrder = async (orderId: string, overrideToken?: string) => {
        showPrompt({
            title: 'Refund Order',
            message: 'Please provide a reason for the full refund:',
            placeholder: 'Customer Request',
            onConfirmText: async (reason: string) => {
                if (!reason) return;
                setUpdatingStatus(true);
                const res = await fetch(`${API_URL}/orders/${orderId}/refund`, {
                    method: 'POST', headers: getHeaders(overrideToken), body: JSON.stringify({ reason }),
                });
                if (res.ok) {
                    fetchOrders();
                    setSelectedOrder(null);
                    showAlert({ title: 'Refunded', message: 'Order has been fully refunded.', variant: 'SUCCESS' });
                } else {
                    showAlert({ title: 'Error', message: 'Failed to refund order.', variant: 'DANGER' });
                }
                setUpdatingStatus(false);
            }
        });
    };

    const handleRefundItemTrigger = (orderId: string, itemId: string, quantity: number) => {
        if (!hasPermission('ORDERS:REFUND')) {
            setOverrideAction({
                action: 'ORDERS:REFUND',
                callback: (token) => handleRefundItem(orderId, itemId, quantity, token)
            });
            return;
        }
        handleRefundItem(orderId, itemId, quantity);
    };

    const handleRefundItem = async (orderId: string, itemId: string, quantity: number, overrideToken?: string) => {
        showPrompt({
            title: 'Refund Item',
            message: `Reason for refunding ${quantity}x of this item:`,
            placeholder: 'Item Refund',
            onConfirmText: async (reason: string) => {
                if (!reason) return;
                setUpdatingStatus(true);
                const res = await fetch(`${API_URL}/orders/${orderId}/items/${itemId}/refund`, {
                    method: 'POST', headers: getHeaders(overrideToken), body: JSON.stringify({ quantity, reason }),
                });
                if (res.ok) {
                    fetchOrders();
                    const r2 = await fetch(`${API_URL}/orders/${orderId}`, { headers: getHeaders() });
                    if (r2.ok) setSelectedOrder(await r2.json());
                    showAlert({ title: 'Item Refunded', message: 'Selected items have been refunded.', variant: 'SUCCESS' });
                } else {
                    showAlert({ title: 'Error', message: 'Failed to refund item.', variant: 'DANGER' });
                }
                setUpdatingStatus(false);
            }
        });
    };

    const handleSendReceipt = async (orderId: string, initialEmail?: string) => {
        showPrompt({
            title: t('send_receipt') || 'Send Receipt',
            message: t('enter_email_msg') || 'Enter the customer\'s email address:',
            placeholder: 'customer@example.com',
            defaultValue: initialEmail || '',
            onConfirmText: async (email: string) => {
                if (!email) return;
                try {
                    await api.post(`/orders/${orderId}/receipt`, { email });
                    showAlert({ title: t('sent') || 'Sent', message: t('receipt_sent_msg') || 'Receipt has been sent via email.', variant: 'SUCCESS' });
                } catch (err) {
                    console.error('[OrdersPage] sendReceipt error:', err);
                    showAlert({ title: t('error') || 'Error', message: t('failed_to_send_receipt') || 'Failed to send receipt.', variant: 'DANGER' });
                }
            }
        });
    };

    const handleExport = (format: 'csv' | 'excel') => {
        const headerMap = {
            receipt_no: t('receipt_no') || 'Receipt No',
            invoice_no: t('invoice_no') || 'Invoice No',
            order_id: t('order_id') || 'Order ID',
            created_at: t('date') || 'Date',
            customer: t('customer') || 'Customer',
            items: t('items') || 'Items',
            type: t('type') || 'Type',
            total: t('total') || 'Total',
            payment: t('payment') || 'Payment Method',
            status: t('status') || 'Status'
        };

        const exportData = filtered.map(o => ({
            receipt_no: o.receiptNumber || '-',
            invoice_no: o.invoiceNumber || '-',
            order_id: `#${o.id.substring(0, 8).toUpperCase()}`,
            created_at: new Date(o.createdAt).toLocaleString(),
            customer: o.customer?.name || t('walk_in'),
            items: (o.items || []).map((item: any) => `${item.quantity}x ${item.product?.name || 'Item'}`).join(', '),
            type: t(o.orderType?.toLowerCase() || 'in_store'),
            total: Number(o.totalAmount || 0).toFixed(2),
            payment: t(o.paymentMethod?.toLowerCase() || 'cash'),
            status: t(o.status?.toLowerCase() || o.status)
        }));

        if (format === 'csv') exportToCSV(exportData, 'Orders_Report', headerMap);
        else exportToExcel(exportData, 'Orders_Report', headerMap);
    };

    return (
        <div className="text-foreground min-h-full">
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('live_orders') || 'Live Orders & Transactions'}</h1>
                    <p className="text-muted-foreground text-lg">{t('live_orders_desc') || 'Real-time ledger of all POS transactions. Click any order to manage it.'}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg text-sm font-bold transition-all">
                        <Download className="h-4 w-4" /> {t('export_csv') || 'Export CSV'}
                    </button>
                    <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-sm font-bold transition-all">
                        <FileSpreadsheet className="h-4 w-4" /> {t('export_excel') || 'Export Excel'}
                    </button>
                </div>
            </div>

            {/* Cached data banner */}
            {usingCache && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning-500/30 bg-warning-500/10 px-4 py-2.5 text-sm text-warning-400">
                    <WifiOff className="h-4 w-4 flex-shrink-0" />
                    <span>Showing cached orders (offline mode).{cacheTime ? ` Last updated: ${new Date(cacheTime).toLocaleString()}` : ''} Changes are disabled until back online.</span>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-3 mb-5 flex-wrap items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={t('search_orders') || "Search by order ID or customer..."}
                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-foreground outline-none focus:border-primary text-sm h-10" />
                </div>

                <div className="flex gap-2 flex-wrap items-center">
                    {/* Date Pickers */}
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-2 h-10">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-transparent border-none text-xs text-foreground outline-none w-[115px]"
                        />
                        <span className="text-muted-foreground text-xs">→</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="bg-transparent border-none text-xs text-foreground outline-none w-[115px]"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                        className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary h-10 min-w-[120px]">
                        <option value="ALL">{t('all_types') || 'All Types'}</option>
                        <option value="IN_STORE">{t('in_store') || 'In Store'}</option>
                        <option value="DINE_IN">{t('dine_in') || 'Dine In'}</option>
                        <option value="TAKEAWAY">{t('takeaway') || 'Takeaway'}</option>
                        <option value="CURBSIDE">{t('curbside') || 'Curbside'}</option>
                        <option value="DELIVERY">{t('delivery') || 'Delivery'}</option>
                    </select>

                    {/* Payment Method Filter */}
                    <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
                        className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary h-10 min-w-[130px]">
                        <option value="ALL">{t('all_payments') || 'Payment Method'}</option>
                        <option value="CASH">{t('cash') || 'Cash'}</option>
                        <option value="CARD">{t('card') || 'Card'}</option>
                    </select>

                    {/* Order Source Filter */}
                    <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
                        className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary h-10 min-w-[130px]">
                        <option value="ALL">{t('all_sources') || 'All Sources'}</option>
                        <option value="POS">🖥️ {t('source_pos') || 'Point of Sale'}</option>
                        <option value="QR_CODE">📱 {t('source_qr') || 'QR Code'}</option>
                        <option value="DELIVERY_PARTNER">🛵 {t('source_delivery') || 'Delivery Partner'}</option>
                        <option value="WEB_STORE">🌐 {t('source_web') || 'Web Store'}</option>
                    </select>

                    <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)}
                        className="bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none focus:border-primary h-10 min-w-[130px]">
                        <option value="ALL">{t('all_payment_status') || 'Payment Status'}</option>
                        <option value="PAID">{t('paid') || 'Paid'}</option>
                        <option value="UNPAID">{t('unpaid') || 'Unpaid'}</option>
                    </select>

                    <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

                    <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {['ALL', ...ALL_STATUSES].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all h-10 whitespace-nowrap ${filterStatus === s ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-success-900/20' : 'border-border text-muted-foreground hover:border-primary/50 hover:bg-muted'}`}>
                                {t(s.toLowerCase()) || s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border/80">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('order')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('customer')} / {t('table')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('items')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('type')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('scheduled_for') || 'Scheduled'}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('total')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('status')}</th>
                                <th className="py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/80 bg-background/20">
                            {loading ? (
                                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">{t('loading')}...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">{t('no_orders_found_msg') || 'No orders found.'}</td></tr>
                            ) : (
                                filtered.map(order => (
                                    <tr key={order.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openOrder(order)}>
                                        <td className="py-4 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center">
                                                    <Receipt className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-mono font-bold text-foreground text-sm">
                                                        {order.receiptNumber ? `#${order.receiptNumber.toString().padStart(3, '0')}` : `#${order.id.substring(0, 8).toUpperCase()}`}
                                                    </div>
                                                    {order.invoiceNumber && (
                                                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                                            {order.invoiceNumber}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Calendar className="h-2.5 w-2.5" />
                                                        {new Date(order.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="text-sm text-foreground font-bold">{order.customer?.name || t('walk_in')}</div>
                                            {order.table && <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 uppercase font-black tracking-wider bg-muted/50 w-fit px-1.5 py-0.5 rounded"><Grid3X3 className="h-2.5 w-2.5" /> {t('table')} #{order.table.number}</div>}
                                        </td>
                                        <td className="px-3 py-4 max-w-xs">
                                            <div className="flex flex-wrap gap-1">
                                                {order.items?.map((item: any, idx: number) => (
                                                    <span key={idx} className="bg-muted text-foreground text-[10px] px-2 py-0.5 rounded border border-border whitespace-nowrap">
                                                        <span className="text-primary font-bold">{item.quantity}x</span> {item.product?.name || 'Item'}
                                                        {item.variant?.name && <span className="text-primary-500/80 font-black ml-1">[{item.variant.name}]</span>}
                                                    </span>
                                                ))}
                                                {(!order.items || order.items.length === 0) && <span className="text-muted-foreground text-xs italic">{t('no_items')}</span>}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border w-fit">{t(order.orderType?.toLowerCase() || 'in_store')}</span>
                                                {order.source === 'QR_CODE' && <span className="text-[9px] font-bold text-primary flex items-center gap-1 uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 w-fit"><QrCode className="w-2.5 h-2.5" /> {t('qr_order') || 'QR Order'}</span>}
                                                {order.source === 'DELIVERY_PARTNER' && <span className="text-[9px] font-bold text-warning-500 flex items-center gap-1 uppercase tracking-tighter bg-warning-500/10 px-1.5 py-0.5 rounded border border-warning-500/20 w-fit"><Truck className="w-2.5 h-2.5" /> {order.externalPlatform || t('third_party') || 'Delivery Platform'}</span>}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            {order.scheduledAt ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">🕐 Pre-Order</span>
                                                    <span className="text-xs text-foreground font-medium">{new Date(order.scheduledAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-muted-foreground">{new Date(order.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="text-primary font-black">{formatCurrency(Number(order.totalAmount) || 0, settings?.currency)}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold">
                                                    {order.paymentMethod === 'CASH' ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                                    {t(order.paymentMethod?.toLowerCase() || 'cash')}
                                                </div>
                                                {Math.round(Number(order.paidAmount) * 100) >= Math.round(Number(order.totalAmount) * 100) ? (
                                                    <span className="text-[8px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">{t('paid') || 'PAID'}</span>
                                                ) : (
                                                    <span className="text-[8px] font-black uppercase bg-error-500/10 text-error-500 px-1.5 py-0.5 rounded border border-error-500/20 animate-pulse">{t('unpaid') || 'UNPAID'}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${STATUS_STYLES[order.status] || 'bg-muted text-muted-foreground border-border'}`}>
                                                {order.status === 'QUEUED' ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-3 w-3 animate-spin [animation-duration:3s]" />
                                                        {t('pending_sync') || 'Pending Sync'}
                                                    </span>
                                                ) : (
                                                    t(order.status?.toLowerCase() || order.status)
                                                )}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <button onClick={e => { e.stopPropagation(); openOrder(order); }}
                                                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-600 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors">
                                                <Eye className="h-3.5 w-3.5" /> {t('view')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── Order Detail Drawer ─── */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedOrder(null)}>
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg bg-card border-l border-border h-full overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('order_receipt')}</p>
                                <h2 className="text-xl font-black text-foreground font-mono">
                                    {selectedOrder.receiptNumber ? `#${selectedOrder.receiptNumber.toString().padStart(3, '0')}` : `#${selectedOrder.id.substring(0, 8).toUpperCase()}`}
                                </h2>
                                {selectedOrder.invoiceNumber && (
                                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{selectedOrder.invoiceNumber}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Meta info */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { icon: User, label: t('customer') || 'Customer', value: selectedOrder.customer?.name || t('walk_in') },
                                    { icon: User, label: t('cashier') || 'Cashier', value: selectedOrder.user?.name || t('online') || 'Online' },
                                    { icon: Grid3X3, label: t('table') || 'Table', value: selectedOrder.table ? `#${selectedOrder.table.number}` : t('none') || 'None' },
                                    { icon: Receipt, label: t('type') || 'Type', value: t(selectedOrder.orderType?.toLowerCase() || 'in_store') },
                                    { icon: selectedOrder.paymentMethod === 'CASH' ? Banknote : CreditCard, label: t('payment') || 'Payment', value: t(selectedOrder.paymentMethod?.toLowerCase() || 'cash') },
                                    ...(selectedOrder.scheduledAt ? [{
                                        icon: Clock,
                                        label: t('scheduled_for') || 'Scheduled',
                                        value: `${new Date(selectedOrder.scheduledAt).toLocaleDateString()} ${new Date(selectedOrder.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    }] : []),
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="p-3 bg-muted/30 border border-border rounded-xl">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Icon className="h-3.5 w-3.5" />{label}</div>
                                        <div className="font-semibold text-foreground text-sm">{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Status update */}
                            <div className="p-4 bg-muted/30 border border-border rounded-xl">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('update_status')}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {ALL_STATUSES.map(s => (
                                        <button key={s} disabled={updatingStatus || selectedOrder.status === s || selectedOrder.isOfflineQueued || !isOnline}
                                            onClick={() => updateStatus(selectedOrder.id, s)}
                                            className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors ${selectedOrder.status === s ? `${STATUS_STYLES[s]} cursor-default` : 'border-border text-muted-foreground hover:border-slate-500 hover:text-foreground disabled:opacity-40'}`}>
                                            {t(s.toLowerCase()) || s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Assign to table */}
                            <div className="p-4 bg-muted/30 border border-border rounded-xl">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" /> {t('assign_to_table') || 'Assign to Table'}
                                </p>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select value={assignTableId} onChange={e => setAssignTableId(e.target.value)}
                                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground appearance-none outline-none focus:border-primary"
                                            disabled={!isOnline || selectedOrder.isOfflineQueued}>
                                            <option value="">{t('no_table') || 'No table'} ({t('walk_in')})</option>
                                            {tables.map(tbl => <option key={tbl.id} value={tbl.id}>{t('table')} #{tbl.number} — {t(tbl.status.toLowerCase()) || tbl.status}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                    <button onClick={() => assignTable(selectedOrder.id)} disabled={updatingTable || !assignTableId || assignTableId === selectedOrder.tableId || !isOnline || selectedOrder.isOfflineQueued}
                                        className="px-4 py-2 bg-primary hover:bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                        {updatingTable ? t('saving') || 'Saving...' : t('assign') || 'Assign'}
                                    </button>
                                </div>
                            </div>

                            {/* Order items */}
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('items')}</p>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col p-3 bg-muted/30 border border-border rounded-xl gap-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-8 w-8 flex-shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-foreground text-sm">{item.quantity}</span>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-foreground">{item.product?.name || 'Item'}</span>
                                                            {item.variant?.name && (
                                                                <span className="text-[10px] text-primary-500 uppercase font-black tracking-widest bg-primary-500/10 px-1.5 py-0.5 rounded border border-primary-500/20">
                                                                    {item.variant.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${item.status === 'REFUNDED' ? 'text-error-500' : 'text-muted-foreground'}`}>{t(item.status?.toLowerCase() || 'pending')}</span>
                                                        {item.note && (
                                                            <p className="text-[11px] text-warning-600 italic mt-1 flex items-center gap-1">
                                                                <MessageSquare className="h-2.5 w-2.5" /> {item.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-primary font-bold">{formatCurrency((Number(item.price) || 0) * item.quantity, settings?.currency)}</span>
                                            </div>
                                            {item.status !== 'REFUNDED' && selectedOrder.status === 'COMPLETED' && (
                                                <button
                                                    onClick={() => handleRefundItemTrigger(selectedOrder.id, item.id, item.quantity)}
                                                    className="self-end text-[10px] font-black uppercase tracking-widest text-error-500 hover:text-error-400 transition-colors flex items-center gap-1"
                                                >
                                                    <XCircle className="h-3 w-3" /> {t('refund_item') || 'Refund Item'}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{t('subtotal')}</span>
                                    <span>{formatCurrency((Number(selectedOrder.totalAmount) || 0) - (Number(selectedOrder.taxAmount) || 0) - (Number(selectedOrder.serviceFeeAmount) || 0) + (Number(selectedOrder.discountAmount) || 0), settings?.currency)}</span>
                                </div>

                                {(Number(selectedOrder.serviceFeeAmount) || 0) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>{t('service_fee')}</span><span>{formatCurrency(Number(selectedOrder.serviceFeeAmount) || 0, settings?.currency)}</span>
                                    </div>
                                )}
                                {(Number(selectedOrder.taxAmount) || 0) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>{t('vat')}</span><span>{formatCurrency(Number(selectedOrder.taxAmount) || 0, settings?.currency)}</span>
                                    </div>
                                )}
                                {(Number(selectedOrder.discountAmount) || 0) > 0 && (
                                    <div className="flex justify-between text-error-500 font-medium">
                                        <span>{t('discount')} {selectedOrder.offerCode ? `(${selectedOrder.offerCode})` : ''}</span><span>-{formatCurrency(Number(selectedOrder.discountAmount) || 0, settings?.currency)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-foreground font-bold text-base border-t border-border pt-2">
                                    <span>{t('total')}</span><span className="text-primary">{formatCurrency(Number(selectedOrder.totalAmount) || 0, settings?.currency)}</span>
                                </div>
                            </div>

                            {selectedOrder.note && (
                                <div className="p-3 rounded-xl bg-warning-500/10 border border-warning-500/20 text-warning-600 dark:text-warning-300 text-sm">
                                    📝 {selectedOrder.note}
                                </div>
                            )}

                            {/* ─── Drovo Delivery Tracker ─── */}
                            {selectedOrder.orderType === 'DELIVERY' && (
                                <div className="rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary-500/5 to-purple-500/5">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/15 bg-primary/10">
                                        <div className="bg-primary/20 p-1.5 rounded-lg">
                                            <Truck className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black uppercase tracking-widest text-primary">Drovo Delivery Tracker</p>
                                            {selectedOrder.externalOrderId ? (
                                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Tracking: {selectedOrder.externalOrderId}</p>
                                            ) : (
                                                <p className="text-[10px] text-warning-500 mt-0.5">⏳ Awaiting dispatch to Drovo...</p>
                                            )}
                                        </div>
                                        {selectedOrder.externalPlatform && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded-full">
                                                {selectedOrder.externalPlatform}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Stepper */}
                                    <div className="px-4 py-4">
                                        <div className="flex items-center justify-between relative">
                                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-primary/10 z-0" />
                                            {DELIVERY_STEPS.map((step, idx) => {
                                                const stepIndex = DELIVERY_STEPS.findIndex(s => s.key === selectedOrder.status);
                                                const isActive = step.key === selectedOrder.status;
                                                const isDone = idx < stepIndex || (selectedOrder.status === 'COMPLETED' && step.key === 'COMPLETED');
                                                const isCancelled = selectedOrder.status === 'CANCELLED';
                                                return (
                                                    <div key={step.key} className="flex flex-col items-center z-10 gap-1.5">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                                                            isCancelled ? 'bg-error-500/10 border-error-500/30 grayscale opacity-40' :
                                                            isDone ? 'bg-primary border-primary shadow-lg shadow-primary-500/30' :
                                                            isActive ? 'bg-primary/20 border-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-transparent animate-pulse' :
                                                            'bg-muted border-border opacity-40'
                                                        }`}>
                                                            {step.emoji}
                                                        </div>
                                                        <p className={`text-[9px] font-bold uppercase tracking-wider text-center max-w-[56px] leading-tight ${
                                                            isCancelled ? 'text-error-400/50' :
                                                            isDone || isActive ? 'text-primary' : 'text-muted-foreground'
                                                        }`}>{step.label}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {selectedOrder.status === 'CANCELLED' && (
                                            <p className="text-center text-[10px] text-error-400 font-bold mt-3">🚫 Order was cancelled</p>
                                        )}
                                    </div>

                                    {/* Driver Info — parsed from the webhook-written note */}
                                    {(() => {
                                        const driver = parseDriverFromNote(selectedOrder.note);
                                        if (!driver.name && !driver.phone) return null;
                                        return (
                                            <div className="mx-4 mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg flex-shrink-0">
                                                    🛵
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-primary">{driver.name || 'Driver Assigned'}</p>
                                                    {driver.phone && (
                                                        <p className="text-[10px] text-primary font-mono">{driver.phone}</p>
                                                    )}
                                                </div>
                                                <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">Driver</span>
                                            </div>
                                        );
                                    })()}

                                    {/* Delivery Address */}
                                    {selectedOrder.deliveryAddress && (
                                        <div className="mx-4 mb-4 flex items-start gap-2 text-xs">
                                            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                                            <p className="text-muted-foreground">{selectedOrder.deliveryAddress}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
                            {/* Fire Now — only for SCHEDULED pre-orders */}
                            {selectedOrder.status === 'SCHEDULED' && selectedOrder.isPreOrder && (
                                <button onClick={() => updateStatus(selectedOrder.id, 'PENDING')} disabled={updatingStatus}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded-lg font-bold transition-colors">
                                    <Clock className="h-4 w-4" /> {t('fire_now') || 'Fire to Kitchen Now'}
                                </button>
                            )}
                            {Number(selectedOrder.paidAmount) < Number(selectedOrder.totalAmount) && selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'REFUNDED' && (
                                <button onClick={() => {
                                    setPayMethod('CASH');
                                    setTenderedAmount('');
                                    setShowPaymentModal(true);
                                }} disabled={updatingStatus}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary text-primary-foreground rounded-lg font-bold transition-colors shadow-lg shadow-success-900/20">
                                    <Banknote className="h-4 w-4" /> {t('pay_and_settle') || 'Pay & Settle'}
                                </button>
                            )}
                            {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'REFUNDED' && Number(selectedOrder.paidAmount) >= Number(selectedOrder.totalAmount) && (
                                <button onClick={() => updateStatus(selectedOrder.id, 'COMPLETED')} disabled={updatingStatus}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary text-primary-foreground rounded-lg font-medium transition-colors">
                                    <CheckCircle2 className="h-4 w-4" /> {t('finalize') || 'Finalize'}
                                </button>
                            )}
                            {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'REFUNDED' && selectedOrder.status !== 'COMPLETED' && Number(selectedOrder.paidAmount || 0) === 0 && (
                                <button onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')} disabled={updatingStatus}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-error-600/20 hover:bg-error-600/40 text-error-500 border border-error-500/30 rounded-lg font-medium transition-colors">
                                    <XCircle className="h-4 w-4" /> {t('cancel') || 'Cancel'}
                                </button>
                            )}
                            {selectedOrder.status === 'COMPLETED' && (
                                                <button onClick={() => handleRefundOrderTrigger(selectedOrder.id)} disabled={updatingStatus}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg font-medium transition-colors">
                                                    <Receipt className="h-4 w-4" /> {t('refund') || 'Refund'}
                                                </button>
                                            )}
                            <button
                                onClick={() => {
                                    const tenantInfo = { name: localStorage.getItem('tenant_name') || 'Restaurant' };
                                    const printSettings = settings || { currency: 'USD', taxRate: 0, serviceFee: 0 };
                                    printOrderReceipt(tenantInfo, selectedOrder, printSettings);
                                }}
                                className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Printer className="h-4 w-4" /> {t('print') || 'Print'}
                            </button>
                            <button
                                onClick={() => handleSendReceipt(selectedOrder.id, selectedOrder.customer?.email)}
                                className="px-4 py-2.5 bg-primary hover:bg-primary text-primary-foreground rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Mail className="h-4 w-4" /> {t('email') || 'Email'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

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

            {/* Payment Selection Modal */}
            {showPaymentModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                            <div>
                                <h3 className="text-xl font-black text-foreground">{t('settle_payment') || 'Settle Payment'}</h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Order #{selectedOrder.receiptNumber}</p>
                            </div>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-card rounded-full text-muted-foreground transition-all">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Amount to Pay */}
                            <div className="bg-muted/30 p-4 rounded-2xl border border-border text-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-1">{t('total_to_pay') || 'Total to Pay'}</span>
                                <div className="text-4xl font-black text-primary tracking-tighter">
                                    {formatCurrency(Number(selectedOrder.totalAmount) - Number(selectedOrder.paidAmount), settings?.currency)}
                                </div>
                            </div>

                            {/* Method Selector */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setPayMethod('CASH')}
                                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all group ${
                                        payMethod === 'CASH' 
                                        ? 'border-primary bg-primary/10 text-primary' 
                                        : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                    }`}
                                >
                                    <div className={`p-3 rounded-2xl transition-all ${payMethod === 'CASH' ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-primary/20'}`}>
                                        <Banknote className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{t('cash') || 'Cash'}</span>
                                </button>
                                <button 
                                    onClick={() => setPayMethod('CARD')}
                                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border-2 transition-all group ${
                                        payMethod === 'CARD' 
                                        ? 'border-primary bg-primary/10 text-primary' 
                                        : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                    }`}
                                >
                                    <div className={`p-3 rounded-2xl transition-all ${payMethod === 'CARD' ? 'bg-primary text-primary-foreground' : 'bg-muted group-hover:bg-primary/20'}`}>
                                        <CreditCard className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{t('card') || 'Card'}</span>
                                </button>
                            </div>

                            {/* Cash Specific Details */}
                            {payMethod === 'CASH' && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">{t('cash_tendered') || 'Cash Tendered'}</label>
                                        <div className="relative">
                                            <input 
                                                autoFocus
                                                type="number" 
                                                value={tenderedAmount}
                                                onChange={(e) => setTenderedAmount(e.target.value)}
                                                className="w-full bg-muted/50 border-2 border-border focus:border-primary rounded-2xl px-5 py-4 text-2xl font-black text-foreground outline-none transition-all pr-16"
                                                placeholder="0.00"
                                            />
                                            <button 
                                                onClick={() => setTenderedAmount((Number(selectedOrder.totalAmount) - Number(selectedOrder.paidAmount)).toString())}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary hover:underline uppercase"
                                            >
                                                {t('exact') || 'Exact'}
                                            </button>
                                        </div>
                                    </div>

                                    {Number(tenderedAmount) > (Number(selectedOrder.totalAmount) - Number(selectedOrder.paidAmount)) && (
                                        <div className="flex items-center justify-between p-4 bg-warning-500/10 border border-warning-500/20 rounded-2xl text-warning-400">
                                            <span className="text-xs font-bold uppercase tracking-widest">{t('change_due') || 'Change Due'}</span>
                                            <span className="text-xl font-black tracking-tight">
                                                {formatCurrency(Number(tenderedAmount) - (Number(selectedOrder.totalAmount) - Number(selectedOrder.paidAmount)), settings?.currency)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                disabled={processingPayment || (payMethod === 'CASH' && (Number(tenderedAmount) < (Number(selectedOrder.totalAmount) - Number(selectedOrder.paidAmount))))}
                                onClick={handleProcessPayment}
                                className="w-full bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground h-16 rounded-[1.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                            >
                                {processingPayment ? (
                                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-6 w-6" />
                                        {t('complete_settlement') || 'Complete Settlement'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
