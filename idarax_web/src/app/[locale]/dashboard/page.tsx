'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, Package, ArrowUpRight, ArrowDownRight, Clock, DollarSign, ListOrdered, AlertTriangle, ChevronRight, Activity, Loader2 } from 'lucide-react';

import { getHeaders, hasFeature } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useLanguage } from '@/components/LanguageContext';
import Link from 'next/link';
import AIReportModal from '@/components/dashboard/AIReportModal';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';


export default function DashboardIndexPage() {
    const { t, formatCurrency } = useLanguage();
    const [overview, setOverview] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [inventoryStats, setInventoryStats] = useState<any>(null);
    const [peakHours, setPeakHours] = useState<any[]>([]);
    const [busiestDays, setBusiestDays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [hasDataPermission, setHasDataPermission] = useState(true);

    // Date filter state
    const [filter, setFilter] = useState<'today' | '7d' | '30d' | 'mtd' | 'custom'>('30d');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showAIReport, setShowAIReport] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    const checkPermission = () => {
        const rawRole = (localStorage.getItem('user_role') || '').trim();
        const roleUpper = rawRole.toUpperCase().replace(/\s/g, '_');
        const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];

        if (ADMIN_ROLES.includes(roleUpper)) return true;

        const rawPermissions = localStorage.getItem('user_permissions');
        if (!rawPermissions) return false;

        try {
            const parsed = JSON.parse(rawPermissions);
            const perms = Array.isArray(parsed) 
                ? parsed.map((p: any) => typeof p === 'string' ? p : p.action)
                : [];
                
            // Match 'DASHBOARD' or 'DASHBOARD:ANYTHING'
            return perms.some((p: string) => p === 'DASHBOARD' || p.startsWith('DASHBOARD:'));
        } catch {
            return false;
        }
    };

    const fetchDashboardData = () => {
        const hasAccess = checkPermission();
        setHasDataPermission(hasAccess);

        if (!hasAccess) {
            setLoading(false);
            // Still fetch settings for currency formatting
            fetchWithAuth(`/tenant/settings`)
                .then(res => res.json())
                .then(res => setSettings(res.data || res))
                .catch(() => { });
            return;
        }

        setLoading(true);
        const h = getHeaders();

        // Calculate dates based on filter
        let start = '';
        const now = new Date();
        if (filter === 'today') {
            const d = new Date(now); d.setHours(0, 0, 0, 0);
            start = d.toISOString();
        } else if (filter === '7d') {
            const d = new Date(now); d.setDate(d.getDate() - 7);
            start = d.toISOString();
        } else if (filter === '30d') {
            const d = new Date(now); d.setDate(d.getDate() - 30);
            start = d.toISOString();
        } else if (filter === 'mtd') {
            const d = new Date(now.getFullYear(), now.getMonth(), 1);
            start = d.toISOString();
        } else if (filter === 'custom' && dateRange.start) {
            start = new Date(dateRange.start).toISOString();
        }

        let query = start ? `?start=${start}` : '';
        if (filter === 'custom' && dateRange.end) {
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            query += `${query ? '&' : '?'}end=${end.toISOString()}`;
        }

        const isEnterprise = settings?.plan?.toUpperCase() === 'ENTERPRISE' || settings?.tier?.toUpperCase() === 'ENTERPRISE';
        const hasAdvancedAnalytics = hasFeature('ADVANCED_ANALYTICS') || isEnterprise;

        const fetchPromises = [
            fetchWithAuth(`/analytics/overview${query}`),
            fetchWithAuth(`/analytics/revenue-chart${query}`),
            fetchWithAuth(`/analytics/top-products?limit=5`),
            fetchWithAuth(`/analytics/inventory-stats`),
            fetchWithAuth(`/tenant/settings`)
        ];

        if (hasAdvancedAnalytics) {
            fetchPromises.push(fetchWithAuth(`/analytics/reports/peak-hours${query}`));
            fetchPromises.push(fetchWithAuth(`/analytics/reports/busiest-days${query}`));
        } else {
            // Push dummy resolved promises to keep indices consistent optionally, 
            // but it's cleaner to handle it by checking length or conditionally assigning.
        }

        Promise.all([
            fetchWithAuth(`/analytics/overview${query}`),
            fetchWithAuth(`/analytics/revenue-chart${query}`),
            fetchWithAuth(`/analytics/top-products?limit=5`),
            fetchWithAuth(`/analytics/inventory-stats`),
            hasAdvancedAnalytics ? fetchWithAuth(`/analytics/reports/peak-hours${query}`) : Promise.resolve({ ok: false, json: () => Promise.resolve([]) }),
            hasAdvancedAnalytics ? fetchWithAuth(`/analytics/reports/busiest-days${query}`) : Promise.resolve({ ok: false, json: () => Promise.resolve([]) }),
            fetchWithAuth(`/tenant/settings`)
        ]).then(async ([ovRes, chRes, tpRes, ivRes, phRes, bdRes, stRes]) => {
            if (ovRes.ok) {
                const res = await ovRes.json();
                setOverview(res.data !== undefined ? res.data : res);
            }
            if (chRes.ok) {
                const res = await chRes.json();
                const d = res.data !== undefined ? res.data : res;
                setChartData(Array.isArray(d) ? d : []);
            }
            if (tpRes.ok) {
                const res = await tpRes.json();
                const d = res.data !== undefined ? res.data : res;
                setTopProducts(Array.isArray(d) ? d : []);
            }
            if (ivRes.ok) {
                const res = await ivRes.json();
                setInventoryStats(res.data !== undefined ? res.data : res);
            }
            if (phRes.ok) {
                const res = await phRes.json();
                const d = res.data !== undefined ? res.data : res;
                // Format hours to look like "2 PM"
                setPeakHours((Array.isArray(d) ? d : []).map((item: any) => ({
                    ...item,
                    hourLabel: item.hour === 0 ? '12 AM' : item.hour < 12 ? `${item.hour} AM` : item.hour === 12 ? '12 PM' : `${item.hour - 12} PM`
                })));
            }
            if (bdRes.ok) {
                const res = await bdRes.json();
                const d = res.data !== undefined ? res.data : res;
                setBusiestDays(Array.isArray(d) ? d : []);
            }
            if (stRes.ok) {
                const res = await stRes.json();
                setSettings(res.data !== undefined ? res.data : res);
            }
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch dashboard data', err);
            setLoading(false);
        });
    };

    useEffect(() => {
        const initDashboard = async () => {
            try {
                const meRes = await fetchWithAuth('/auth/me');
                if (meRes.ok) {
                    const data = await meRes.json();
                    const features = data.data?.features || data.features;
                    if (features) {
                        localStorage.setItem('user_features', JSON.stringify(features));
                    }
                }
            } catch (err) {
                console.error('Failed to sync user profile:', err);
            }
            fetchDashboardData();
        };

        // We only really need to sync features on the first load of the dashboard,
        // but it's safe to do on every filter change as well.
        initDashboard();
    }, [filter, dateRange.start, dateRange.end]);

    // WebSocket for Live Updates
    useEffect(() => {
        if (!hasDataPermission || filter !== 'today') return;

        const tenantId = Cookies.get('tenant_id');
        const branchId = Cookies.get('branch_id');
        const token = localStorage.getItem('access_token');

        if (!tenantId || !token) return;

        const socket = io(`${API_URL.replace('/v1', '')}/dashboard`, {
            extraHeaders: {
                'Authorization': `Bearer ${token}`,
                'x-tenant-id': tenantId
            },
            query: { branchId: branchId || 'all' }
        });

        socket.on('connect', () => {
            console.log('Dashboard WebSocket connected');
        });

        socket.on('stats_updated', (data: any) => {
            console.log('Dashboard stats received via WS:', data);
            setOverview(data);
            // Optionally update last refreshed time
        });

        socket.on('connect_error', (err) => {
            console.error('Dashboard WebSocket connection error:', err);
        });

        return () => {
            socket.disconnect();
        };
    }, [hasDataPermission, filter]);

    const stats = [
        {
            label: filter === 'today' ? t('gross_sales_today') : t('gross_sales_period'),
            value: overview ? formatCurrency(parseFloat(overview.grossSales || overview.grossSalesToday || '0'), settings?.currency) : formatCurrency(0, settings?.currency),
            icon: DollarSign,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            label: t('net_profit'),
            value: overview ? formatCurrency(parseFloat(overview.netProfit || '0'), settings?.currency) : formatCurrency(0, settings?.currency),
            icon: TrendingUp,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            label: filter === 'today' ? t('orders_today') : t('total_orders'),
            value: overview ? (overview.orderCount !== undefined ? overview.orderCount : overview.orderCountToday) : '0',
            icon: ListOrdered,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10'
        },
        {
            label: t('pending_kds'),
            value: overview ? overview.liveKdsTickets : '0',
            icon: Clock,
            color: 'text-warning-400',
            bg: 'bg-warning-500/10'
        },
        {
            label: t('low_stock_items_label'),
            value: overview ? overview.lowStockCount : '0',
            icon: AlertTriangle,
            color: 'text-error-400',
            bg: 'bg-error-500/10'
        },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-success-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="text-foreground animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('executive_overview')}</h1>
                    <p className="text-muted-foreground text-lg">{t('real_time_metrics')}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex bg-muted border border-border rounded-xl p-1 shadow-inner flex-wrap">
                        {[
                            { id: 'today', label: t('today') },
                            { id: '7d', label: t('7d') },
                            { id: '30d', label: t('30d') },
                            { id: 'mtd', label: t('mtd') },
                            { id: 'custom', label: t('custom_range') }
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setFilter(p.id as any)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === p.id ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {filter === 'custom' && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-card border border-border rounded-lg px-3 py-1.5 text-[10px] font-bold text-foreground outline-none focus:border-primary"
                            />
                            <span className="text-muted-foreground font-black text-xs">{t('to')}</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-card border border-border rounded-lg px-3 py-1.5 text-[10px] font-bold text-foreground outline-none focus:border-primary"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        {t('refreshed_just_now')}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {hasDataPermission ? stats.map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-2xl backdrop-blur-sm group hover:border-border/80 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1">
                                <Activity className="h-3 w-3" /> {t('live')}
                            </span>
                        </div>
                        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                        <div className="text-3xl font-black text-foreground group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                    </div>
                )) : Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-2xl backdrop-blur-sm opacity-50 flex flex-col items-center justify-center text-center py-12">
                        <DollarSign className="h-8 w-8 text-muted-foreground/20 mb-2" />
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">{t('permission_denied')}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue Trend Chart */}
                <div className="lg:col-span-2 bg-card border border-border p-6 rounded-3xl backdrop-blur-sm shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            {t('revenue_forecast')}
                        </h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-lg bg-muted text-xs text-muted-foreground border border-border">{t('last_30_days')}</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                        {mounted && hasDataPermission ? (
                            <ResponsiveContainer width="99.9%" height="100%">
                                <AreaChart data={Array.isArray(chartData) ? chartData : []}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#475569"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => formatCurrency(val, settings?.currency)}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid #1e293b', borderRadius: '12px' }}
                                        itemStyle={{ color: 'var(--success)', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : !hasDataPermission ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/50 rounded-2xl min-h-[300px]">
                                <TrendingUp className="h-12 w-12 opacity-10 mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest opacity-30">{t('restricted_data')}</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-card border border-border p-6 rounded-3xl backdrop-blur-sm shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary-400" />
                        {t('best_sellers')}
                    </h3>
                    {hasDataPermission ? (
                        <div className="space-y-4">
                            {(!Array.isArray(topProducts) || topProducts.length === 0) ? (
                                <div className="text-center py-10 text-muted-foreground text-sm">{t('no_sales_data')}</div>
                            ) : topProducts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold text-xs border border-primary-500/20">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">{p.name}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.quantity} {t('orders')}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-primary">{formatCurrency(Number(p.revenue) || 0, settings?.currency)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground/30 text-[10px] font-bold uppercase">
                            {t('restricted')}
                        </div>
                    )}
                    <Link href="/dashboard/inventory" className="w-full mt-6 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all border border-border flex items-center justify-center gap-2 outline-none">
                        {t('view_full_catalog')} <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Health */}
                <div className="bg-card border border-border p-6 rounded-3xl backdrop-blur-sm shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Package className="h-5 w-5 text-error-400" />
                            {t('inventory_health')}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-error-500/10 text-error-500 border border-error-500/20 uppercase font-bold tracking-tighter">{t('live_monitoring')}</span>
                    </div>
                    {hasDataPermission ? (
                        <div className="space-y-3">
                            {(!Array.isArray(inventoryStats?.lowStockItems) || inventoryStats.lowStockItems.length === 0) ? (
                                <div className="text-center py-6 text-muted-foreground text-sm">{t('all_inventory_healthy')}</div>
                            ) : inventoryStats.lowStockItems.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/50 group hover:border-error-500/30 transition-all">
                                    <div>
                                        <div className="text-sm font-bold text-foreground">{item.name}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase">{t('current_stock_level')}</div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className={`text-sm font-black ${item.stock <= 0 ? 'text-error-500' : 'text-warning-500'}`}>
                                            {item.stock} {t('units')}
                                        </div>
                                        <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden relative">
                                            <div className="absolute left-0 top-0 h-full bg-error-500 animate-pulse" style={{ width: `${Math.min(100, (item.stock / 5) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground/30 text-[10px] font-bold uppercase">
                            {t('restricted')}
                        </div>
                    )}
                </div>

                {/* Growth Insights placeholder */}
                <div className={`bg-gradient-to-br from-primary-600 to-primary-900 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center ${!hasDataPermission && 'grayscale opacity-70 cursor-not-allowed'}`}>
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <TrendingUp className="h-40 w-40 text-black" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2 italic">{t('growth_insights')}</h3>
                    <p className="text-primary-100 text-sm max-w-xs mb-6 font-medium leading-relaxed">
                        {hasDataPermission ? t('growth_desc') : t('restricted_insight_msg') || 'Growth data is restricted for your role.'}
                    </p>
                    <button
                        onClick={() => hasDataPermission && setShowAIReport(true)}
                        disabled={!hasDataPermission}
                        className={`bg-white text-primary-900 px-6 py-3 rounded-2xl text-sm font-black w-fit shadow-xl transition-transform ${hasDataPermission ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed'}`}
                    >
                        {t('view_ai_report')}
                    </button>
                </div>
            </div>

            {/* Time & Day Analytics Row */}
            {hasDataPermission && (
                <div className="mt-8">
                    {/* Busiest Days & Peak Hours Charts - Hidden if not subscribed */}
                    {(hasFeature('ADVANCED_ANALYTICS') || settings?.plan?.toUpperCase() === 'ENTERPRISE' || settings?.tier?.toUpperCase() === 'ENTERPRISE') ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card border border-border p-6 rounded-3xl backdrop-blur-sm shadow-sm flex flex-col">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                                    <Activity className="h-5 w-5 text-warning-400" />
                                    {t('busiest_days')}
                                </h3>
                                {busiestDays.length > 0 ? (
                                    <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
                                        <ResponsiveContainer width="99.9%" height="100%">
                                            <BarChart data={busiestDays}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="dayName" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickFormatter={(val) => formatCurrency(val, settings?.currency)} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }} />
                                                <Bar yAxisId="left" dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} name={t('revenue') || 'Revenue'} />
                                                <Bar yAxisId="right" dataKey="orderCount" fill="#fcd34d" radius={[4, 4, 0, 0]} name={t('orders') || 'Orders'} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground/50">
                                        {t('no_data_available')}
                                    </div>
                                )}
                            </div>

                            <div className="bg-card border border-border p-6 rounded-3xl backdrop-blur-sm shadow-sm flex flex-col">
                                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                                    <Activity className="h-5 w-5 text-warning-400" />
                                    {t('peak_hours')}
                                </h3>
                                {peakHours.length > 0 ? (
                                    <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
                                        <ResponsiveContainer width="99.9%" height="100%">
                                            <BarChart data={peakHours}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="hourLabel" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                                                <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickFormatter={(val) => formatCurrency(val, settings?.currency)} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#818cf8', fontWeight: 'bold' }} />
                                                <Bar yAxisId="left" dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} name={t('revenue') || 'Revenue'} />
                                                <Bar yAxisId="right" dataKey="orderCount" fill="#cbd5e1" radius={[4, 4, 0, 0]} name={t('orders') || 'Orders'} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground/50">
                                        {t('no_data_available')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card border border-border p-6 rounded-3xl backdrop-blur-sm shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden h-[250px]">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 to-purple-900/30"></div>
                                <Activity className="w-12 h-12 text-primary/50 mb-4 z-10" />
                                <h2 className="text-xl font-bold mb-2 z-10">{t('busiest_days')}</h2>
                                <p className="text-sm text-muted-foreground mb-4 z-10 max-w-[80%]">{t('busiest_days_desc')}</p>
                                <span className="px-3 py-1 bg-warning-500/20 text-warning-500 rounded-full text-xs font-bold z-10 border border-warning-500/30 uppercase tracking-wide">{t('enterprise_required')}</span>
                            </div>
                            <div className="bg-card border border-border p-6 rounded-3xl backdrop-blur-sm shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden h-[250px]">
                                <div className="absolute inset-0 bg-gradient-to-br from-warning-900/30 to-error-900/30"></div>
                                <Clock className="w-12 h-12 text-warning-400/50 mb-4 z-10" />
                                <h2 className="text-xl font-bold mb-2 z-10">{t('peak_hours')}</h2>
                                <p className="text-sm text-muted-foreground mb-4 z-10 max-w-[80%]">{t('peak_hours_desc')}</p>
                                <span className="px-3 py-1 bg-warning-500/20 text-warning-500 rounded-full text-xs font-bold z-10 border border-warning-500/30 uppercase tracking-wide">{t('enterprise_required')}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <AIReportModal
                isOpen={showAIReport}
                onClose={() => setShowAIReport(false)}
                data={{
                    revenue: overview,
                    inventory: inventoryStats,
                    topProducts: topProducts
                }}
            />
        </div>
    );
}
